/**
 * Set-based, user-scoped refresh of review assignments.
 *
 * Given a list of userIds whose permissions may have changed, brings their
 * review_assignment and review_assignment_assigner_join rows into line with
 * their current REVIEW/ASSIGN permissions across all pending applications,
 * without visiting applications one at a time and without touching any other
 * user's rows. Replaces (for the userId case only) the legacy loop that
 * re-generated assignments for every reviewer on every application the user
 * could possibly access.
 *
 * Runs as five sequential statements (no cross-statement transaction --
 * DBConnect.query uses a fresh pooled client per call). Each statement is
 * individually atomic and the whole sequence is idempotent and convergent, so
 * a mid-run failure is repaired by the next run. Concurrent runs (the action
 * is async in some templates) are safe: inserts are ON CONFLICT-guarded and
 * deletes are scoped to the target users.
 *
 * Scope per application: current stage only, levels 1..max existing
 * assignment level (default 1), skipping applications still in their first
 * DRAFT -- exact parity with generateReviewAssignments.
 */
import config from '../../../src/config'
import { updateReviewerStats } from '../../../src/components/database/updateReviewerStats'
import { UserRefreshResult } from './types'

// Shared CTE prelude, parameterized on $1 = int[] of user ids.
//
// scoped_apps: pending applications the users could be connected to -- via
// template permissions, existing assignments, or existing assigner joins (the
// last so stale joins can be cleaned). DISTINCT ON guards against duplicate
// rows from dirty is_current history flags.
//
// user_review_perms: the users' REVIEW permissions aggregated per
// (user, org, template, stage, level). One user can hold several permission
// rows for the same slot; section restrictions merge NULL-dominant (any
// unrestricted permission => unrestricted).
const TARGET_CTES = `
WITH scoped_apps AS (
  SELECT DISTINCT ON (assl.application_id)
    assl.application_id,
    assl.template_id,
    assl.stage_id,
    assl.stage_number,
    assl.stage_history_time_created,
    assl.status
  FROM application_stage_status_latest assl
  WHERE assl.outcome = 'PENDING'
    AND assl.stage_id IS NOT NULL
    AND (
      assl.template_id IN (
        SELECT "templateId" FROM permissions_all
        WHERE "userId" = ANY($1)
          AND "permissionType" IN ('REVIEW', 'ASSIGN')
          AND "templateId" IS NOT NULL
      )
      OR assl.application_id IN (
        SELECT application_id FROM review_assignment WHERE reviewer_id = ANY($1)
      )
      OR assl.application_id IN (
        SELECT ra.application_id
        FROM review_assignment_assigner_join raaj
        JOIN review_assignment ra ON ra.id = raaj.review_assignment_id
        WHERE raaj.assigner_id = ANY($1)
      )
    )
  ORDER BY assl.application_id, assl.stage_history_time_created DESC NULLS LAST,
    assl.status_history_time_created DESC NULLS LAST
),
app_levels AS (
  SELECT
    sa.application_id, sa.template_id, sa.stage_id, sa.stage_number,
    sa.stage_history_time_created,
    gen.level_number,
    stg.max_stage_number,
    lvl.max_level_number
  FROM scoped_apps sa
  CROSS JOIN LATERAL (
    SELECT MAX(ra.level_number) AS raw_max
    FROM review_assignment ra
    WHERE ra.application_id = sa.application_id AND ra.stage_number = sa.stage_number
  ) existing
  CROSS JOIN LATERAL generate_series(1, COALESCE(existing.raw_max, 1)) AS gen (level_number)
  CROSS JOIN LATERAL (
    SELECT MAX(number) AS max_stage_number
    FROM template_stage WHERE template_id = sa.template_id
  ) stg
  CROSS JOIN LATERAL (
    SELECT MAX(number) AS max_level_number
    FROM template_stage_review_level WHERE stage_id = sa.stage_id
  ) lvl
  -- Skip applications still in their first draft (no assignments yet)
  WHERE NOT (sa.status = 'DRAFT' AND existing.raw_max IS NULL)
),
user_review_perms AS (
  SELECT
    "userId" AS user_id,
    "orgId" AS org_id,
    "templateId" AS template_id,
    "stageNumber" AS stage_number,
    "reviewLevel" AS level_number,
    bool_or("allowedSections" IS NULL) AS has_unrestricted,
    bool_or("canSelfAssign") AS can_self_assign,
    bool_or("canMakeFinalDecision") AS can_make_final_decision
  FROM permissions_all
  WHERE "userId" = ANY($1) AND "permissionType" = 'REVIEW'
  GROUP BY 1, 2, 3, 4, 5
),
user_review_perm_sections AS (
  SELECT
    "userId" AS user_id, "orgId" AS org_id, "templateId" AS template_id,
    "stageNumber" AS stage_number, "reviewLevel" AS level_number,
    array_agg(DISTINCT s ORDER BY s) AS merged_sections
  FROM permissions_all, unnest("allowedSections") AS s
  WHERE "userId" = ANY($1) AND "permissionType" = 'REVIEW'
  GROUP BY 1, 2, 3, 4, 5
),
user_assign_perms AS (
  SELECT DISTINCT
    "userId" AS user_id, "orgId" AS org_id, "templateId" AS template_id,
    "stageNumber" AS stage_number, "reviewLevel" AS level_number
  FROM permissions_all
  WHERE "userId" = ANY($1) AND "permissionType" = 'ASSIGN'
)`

// The users' desired assignment rows: one per (user, org, app, stage, level)
// where a REVIEW permission matches an in-scope application level
const CANDIDATES_CTE = `,
candidate_assignments AS (
  SELECT
    p.user_id, p.org_id,
    al.application_id, al.stage_id, al.stage_number,
    al.stage_history_time_created, al.level_number,
    CASE WHEN p.has_unrestricted THEN NULL ELSE ps.merged_sections END AS allowed_sections,
    (p.can_self_assign OR al.level_number > 1) AS is_self_assignable,
    p.can_make_final_decision AS is_final_decision,
    (al.level_number = COALESCE(al.max_level_number, 0)) AS is_last_level,
    (al.stage_number = al.max_stage_number) AS is_last_stage
  FROM app_levels al
  JOIN user_review_perms p
    ON p.template_id = al.template_id
    AND p.stage_number = al.stage_number
    AND p.level_number = al.level_number
  LEFT JOIN user_review_perm_sections ps
    ON ps.user_id = p.user_id
    AND ps.org_id IS NOT DISTINCT FROM p.org_id
    AND ps.template_id = p.template_id
    AND ps.stage_number = p.stage_number
    AND ps.level_number = p.level_number
)`

// 1. Delete the users' assignments at in-scope application levels where no
// matching REVIEW permission remains. Cascades to review and assigner-join
// records (same semantics as the legacy per-row delete).
const DELETE_REVOKED_ASSIGNMENTS = `${TARGET_CTES},
deleted AS (
  DELETE FROM review_assignment ra
  USING app_levels al
  WHERE ra.application_id = al.application_id
    AND ra.stage_number = al.stage_number
    AND ra.level_number = al.level_number
    AND ra.reviewer_id = ANY($1)
    AND NOT EXISTS (
      SELECT 1 FROM user_review_perms p
      WHERE p.user_id = ra.reviewer_id
        AND p.template_id = al.template_id
        AND p.stage_number = al.stage_number
        AND p.level_number = al.level_number
    )
  RETURNING ra.application_id
)
SELECT application_id, count(*)::int AS count FROM deleted GROUP BY application_id`

// 2 & 3. Upsert the users' assignments. Two statements because each of the
// two partial unique indexes (org / no-org) needs its own ON CONFLICT arbiter.
// On conflict only allowed_sections is updated -- status and
// is_self_assignable are preserved -- and the IS DISTINCT FROM guard skips
// unchanged rows entirely so no UPDATE triggers (stats notify, section
// revalidation, time_updated bump) fire for them. template_id and level_id
// are filled by DB triggers.
const upsertAssignmentsQuery = (withOrg: boolean) => `${TARGET_CTES}${CANDIDATES_CTE},
upserted AS (
  INSERT INTO review_assignment (
    reviewer_id, organisation_id, stage_id, stage_number, time_stage_created,
    status, application_id, allowed_sections, level_number,
    is_last_level, is_last_stage, is_final_decision, is_self_assignable
  )
  SELECT
    user_id, org_id, stage_id, stage_number, stage_history_time_created,
    'AVAILABLE', application_id, allowed_sections, level_number,
    is_last_level, is_last_stage, is_final_decision, is_self_assignable
  FROM candidate_assignments
  WHERE org_id IS ${withOrg ? 'NOT NULL' : 'NULL'}
  ON CONFLICT (reviewer_id, ${withOrg ? 'organisation_id, ' : ''}stage_number, application_id, level_number)
    WHERE organisation_id IS ${withOrg ? 'NOT ' : ''}NULL
  DO UPDATE SET allowed_sections = EXCLUDED.allowed_sections
    WHERE review_assignment.allowed_sections IS DISTINCT FROM EXCLUDED.allowed_sections
  RETURNING application_id, (xmax = 0) AS was_inserted
)
SELECT application_id,
  count(*) FILTER (WHERE was_inserted)::int AS created_count,
  count(*) FILTER (WHERE NOT was_inserted)::int AS updated_count
FROM upserted GROUP BY application_id`

// 4. Delete the users' assigner joins at in-scope application levels where no
// matching ASSIGN permission remains. (The legacy implementation never
// cleaned these up.)
const DELETE_STALE_ASSIGNER_JOINS = `${TARGET_CTES},
deleted AS (
  DELETE FROM review_assignment_assigner_join raaj
  USING review_assignment ra, app_levels al
  WHERE raaj.review_assignment_id = ra.id
    AND raaj.assigner_id = ANY($1)
    AND ra.application_id = al.application_id
    AND ra.stage_number = al.stage_number
    AND ra.level_number = al.level_number
    AND NOT EXISTS (
      SELECT 1 FROM user_assign_perms p
      WHERE p.user_id = raaj.assigner_id
        AND p.template_id = al.template_id
        AND p.stage_number = al.stage_number
        AND p.level_number = al.level_number
    )
  RETURNING ra.application_id
)
SELECT application_id, count(*)::int AS count FROM deleted GROUP BY application_id`

// 5. Insert the users' assigner joins against ALL assignments at levels where
// they hold an ASSIGN permission. Runs after the upserts (so new assignments
// are covered) and selects from the table rather than the upsert results,
// because the guarded upsert doesn't return untouched rows. ON CONFLICT
// without an arbiter covers both partial unique indexes.
const INSERT_ASSIGNER_JOINS = `${TARGET_CTES},
inserted AS (
  INSERT INTO review_assignment_assigner_join (assigner_id, organisation_id, review_assignment_id)
  SELECT DISTINCT p.user_id, p.org_id, ra.id
  FROM app_levels al
  JOIN user_assign_perms p
    ON p.template_id = al.template_id
    AND p.stage_number = al.stage_number
    AND p.level_number = al.level_number
  JOIN review_assignment ra
    ON ra.application_id = al.application_id
    AND ra.stage_number = al.stage_number
    AND ra.level_number = al.level_number
  ON CONFLICT DO NOTHING
  RETURNING review_assignment_id
)
SELECT ra.application_id, count(*)::int AS count
FROM inserted i
JOIN review_assignment ra ON ra.id = i.review_assignment_id
GROUP BY ra.application_id`

const refreshAssignmentsForUsers = async (
  DBConnect: any,
  userIds: number[]
): Promise<UserRefreshResult[]> => {
  const results = new Map<number, UserRefreshResult>()
  const resultFor = (applicationId: number) => {
    if (!results.has(applicationId))
      results.set(applicationId, {
        applicationId,
        assignmentsCreated: 0,
        assignmentsUpdated: 0,
        assignmentsDeleted: 0,
        assignerJoinsCreated: 0,
        assignerJoinsDeleted: 0,
      })
    return results.get(applicationId) as UserRefreshResult
  }

  const run = async (text: string) =>
    (await DBConnect.query({ text, values: [userIds] })).rows

  for (const row of await run(DELETE_REVOKED_ASSIGNMENTS))
    resultFor(row.application_id).assignmentsDeleted += row.count

  for (const withOrg of [false, true])
    for (const row of await run(upsertAssignmentsQuery(withOrg))) {
      resultFor(row.application_id).assignmentsCreated += row.created_count
      resultFor(row.application_id).assignmentsUpdated += row.updated_count
    }

  for (const row of await run(DELETE_STALE_ASSIGNER_JOINS))
    resultFor(row.application_id).assignerJoinsDeleted += row.count

  for (const row of await run(INSERT_ASSIGNER_JOINS))
    resultFor(row.application_id).assignerJoinsCreated += row.count

  const updatedApplications = Array.from(results.values()).sort(
    (a, b) => a.applicationId - b.applicationId
  )

  // Refresh the cached reviewer/assigner action lists for the affected users
  // on the applications that actually changed. One queued job for the whole
  // run (the legacy path queued an all-staff job per visited application).
  // INSERTs/DELETEs fire no stats triggers, so this is the only cache update
  // for them; rows whose allowed_sections genuinely changed also notify the
  // all-staff path via DB trigger, as before.
  const changedAppIds = updatedApplications.map(({ applicationId }) => applicationId)
  if (changedAppIds.length > 0)
    config.Throttle.add<{ appIds: number[]; userIds: number[] }>({
      name: `Reviewer stats update for user(s) ${userIds.join(', ')} on ${
        changedAppIds.length
      } application(s)`,
      data: { appIds: changedAppIds, userIds },
      action: async ({ appIds, userIds }) => {
        for (const appId of appIds) await updateReviewerStats(appId, userIds)
      },
    })

  return updatedApplications
}

export default refreshAssignmentsForUsers
