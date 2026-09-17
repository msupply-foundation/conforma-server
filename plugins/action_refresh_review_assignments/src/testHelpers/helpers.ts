/**
 * Helpers for the refreshReviewAssignments test suites: throttle draining and
 * canonical DB end-state queries. All assertions compare against these
 * normalized shapes (section arrays sorted, enums as text, timestamps as fixed
 * UTC strings) so the same expected literals hold for both the legacy and the
 * set-based implementation.
 */
import DBConnect from '../../../../src/components/database/databaseConnect'
import config from '../../../../src/config'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Both stats paths (the action's own updateReviewerStats job and the
// pg_notify-driven updateReviewerStatsFromDBEvent) funnel through the global
// EventThrottle, so draining it flushes all pending cache updates. The
// leading sleep lets in-flight pg_notify deliveries land in the queue first.
export const drainThrottle = async () => {
  await sleep(300)
  while (config.Throttle.queue.length > 0 || config.Throttle.queueActive) await sleep(50)
  await sleep(100)
}

export const pollUntil = async (
  check: () => Promise<boolean>,
  timeoutMs = 5000,
  intervalMs = 100
) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await check()) return true
    await sleep(intervalMs)
  }
  return false
}

interface AssignmentQueryOptions {
  includeIds?: boolean
  includeTimeUpdated?: boolean
}

// A user's review_assignment rows in the fixture range, normalized for
// comparison. time_updated is excluded by default: the legacy upsert bumps it
// on every run, so only new-path-only tests may assert on it.
export const getUserAssignments = async (
  userId: number,
  { includeIds = false, includeTimeUpdated = false }: AssignmentQueryOptions = {}
) => {
  const result = await DBConnect.query({
    text: `
      SELECT ${includeIds ? 'id,' : ''} ${includeTimeUpdated ? 'time_updated,' : ''}
        application_id, stage_number, level_number, reviewer_id, organisation_id,
        status::text AS status,
        (SELECT array_agg(x ORDER BY x) FROM unnest(allowed_sections) x) AS allowed_sections,
        (SELECT array_agg(x ORDER BY x) FROM unnest(assigned_sections) x) AS assigned_sections,
        is_last_level, is_last_stage, is_final_decision, is_self_assignable,
        template_id, stage_id, level_id,
        to_char(time_stage_created AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS')
          AS time_stage_created
      FROM review_assignment
      WHERE reviewer_id = $1 AND application_id BETWEEN 90000 AND 90999
      ORDER BY application_id, stage_number, level_number, organisation_id NULLS FIRST`,
    values: [userId],
  })
  return result.rows
}

// A user's assigner joins in the fixture range, resolved through the
// assignment they attach to
export const getUserAssignerJoins = async (assignerId: number) => {
  const result = await DBConnect.query({
    text: `
      SELECT ra.application_id, ra.stage_number, ra.level_number,
        ra.reviewer_id, ra.organisation_id AS assignment_org,
        j.organisation_id AS assigner_org
      FROM review_assignment_assigner_join j
      JOIN review_assignment ra ON ra.id = j.review_assignment_id
      WHERE j.assigner_id = $1 AND ra.application_id BETWEEN 90000 AND 90999
      ORDER BY ra.application_id, ra.stage_number, ra.level_number,
        ra.reviewer_id, ra.organisation_id NULLS FIRST`,
    values: [assignerId],
  })
  return result.rows
}

// A user's cached reviewer/assigner actions in the fixture range
export const getUserReviewerActions = async (userId: number) => {
  const result = await DBConnect.query({
    text: `
      SELECT application_id, reviewer_action::text AS reviewer_action,
        assigner_action::text AS assigner_action
      FROM application_reviewer_action
      WHERE user_id = $1 AND application_id BETWEEN 90000 AND 90999
      ORDER BY application_id`,
    values: [userId],
  })
  return result.rows
}

export const countRows = async (table: string, whereClause: string) => {
  const result = await DBConnect.query({
    text: `SELECT count(*)::int AS count FROM ${table} WHERE ${whereClause}`,
  })
  return result.rows[0].count
}
