/**
 * Characterization tests for the refreshReviewAssignments action's user-scoped
 * path (userId parameter provided).
 *
 * These pin the OBSERVABLE database end-state, not implementation internals,
 * so the same expected literals must pass against both the legacy
 * per-application implementation and the set-based refactor. Deliberate
 * behavioral differences of the new implementation live in
 * refreshReviewAssignmentsNewBehaviour.test.ts instead.
 *
 * Requirements: local Postgres with a current schema (any data — the fixture
 * is self-contained in the 90000+ id range); the dev server must NOT be
 * running. Run with:
 *
 *   npx jest --runInBand --forceExit plugins/action_refresh_review_assignments
 *
 * (--forceExit because importing DBConnect opens a pg LISTEN client that
 * keeps the process alive — same as the other plugin test suites.)
 */
import DBConnect from '../../../src/components/database/databaseConnect'
import { action as refreshReviewAssignments } from './index'
import {
  SEED_SQL,
  CLEANUP_SQL,
  USER_U,
  USER_V,
  ORG,
  T1,
  T2,
  T1_STAGE_1,
  T1_STAGE_2,
  LEVEL_T1_S1_L1,
  LEVEL_T1_S2_L1,
  LEVEL_T1_S2_L2,
  APP_GRANT,
  APP_FIRST_DRAFT,
  APP_APPROVED,
  APP_ASSIGNED,
  APP_DRAFT_LATER,
  APP_TWO_LEVELS,
  APP_REVOKED,
  REVIEW_ON_REVOKED,
  T0_LITERAL,
} from './testHelpers/fixtures'
import {
  drainThrottle,
  pollUntil,
  getUserAssignments,
  getUserAssignerJoins,
  getUserReviewerActions,
  countRows,
} from './testHelpers/helpers'

jest.setTimeout(120000)

let actionResult: any
let vPreState: any[]

beforeAll(async () => {
  await DBConnect.query({ text: CLEANUP_SQL })
  await DBConnect.query({ text: SEED_SQL })
  vPreState = await getUserAssignments(USER_V, { includeIds: true })
  actionResult = await refreshReviewAssignments({
    parameters: { userId: USER_U },
    DBConnect,
  })
  await drainThrottle()
})

afterAll(async () => {
  await drainThrottle()
  await DBConnect.query({ text: CLEANUP_SQL })
  await DBConnect.end()
})

// The complete expected set of U's review_assignment rows after the refresh,
// in (application_id, stage_number, level_number, organisation_id NULLS FIRST)
// order. Derived from the fixture permissions — see fixtures.ts for the
// permission layout.
const EXPECTED_U_ROWS = [
  {
    application_id: APP_GRANT,
    stage_number: 1,
    level_number: 1,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'AVAILABLE',
    allowed_sections: null,
    assigned_sections: null,
    is_last_level: true,
    is_last_stage: false,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: T1,
    stage_id: T1_STAGE_1,
    level_id: LEVEL_T1_S1_L1,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_APPROVED,
    stage_number: 1,
    level_number: 1,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'AVAILABLE',
    allowed_sections: ['a'],
    assigned_sections: null,
    is_last_level: true,
    is_last_stage: false,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: T1,
    stage_id: T1_STAGE_1,
    level_id: LEVEL_T1_S1_L1,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_ASSIGNED,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'ASSIGNED',
    allowed_sections: ['a', 'b'],
    assigned_sections: ['a'],
    is_last_level: false,
    is_last_stage: true,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: T1,
    stage_id: T1_STAGE_2,
    level_id: LEVEL_T1_S2_L1,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_DRAFT_LATER,
    stage_number: 1,
    level_number: 1,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'AVAILABLE',
    allowed_sections: null,
    assigned_sections: null,
    is_last_level: true,
    is_last_stage: false,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: T1,
    stage_id: T1_STAGE_1,
    level_id: LEVEL_T1_S1_L1,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_TWO_LEVELS,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'AVAILABLE',
    allowed_sections: ['a', 'b'],
    assigned_sections: null,
    is_last_level: false,
    is_last_stage: true,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: T1,
    stage_id: T1_STAGE_2,
    level_id: LEVEL_T1_S2_L1,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_TWO_LEVELS,
    stage_number: 2,
    level_number: 2,
    reviewer_id: USER_U,
    organisation_id: null,
    status: 'AVAILABLE',
    allowed_sections: null,
    assigned_sections: null,
    is_last_level: true,
    is_last_stage: true,
    is_final_decision: false,
    is_self_assignable: true,
    template_id: T1,
    stage_id: T1_STAGE_2,
    level_id: LEVEL_T1_S2_L2,
    time_stage_created: T0_LITERAL,
  },
  {
    application_id: APP_TWO_LEVELS,
    stage_number: 2,
    level_number: 2,
    reviewer_id: USER_U,
    organisation_id: ORG,
    status: 'AVAILABLE',
    allowed_sections: null,
    assigned_sections: null,
    is_last_level: true,
    is_last_stage: true,
    is_final_decision: false,
    is_self_assignable: true,
    template_id: T1,
    stage_id: T1_STAGE_2,
    level_id: LEVEL_T1_S2_L2,
    time_stage_created: T0_LITERAL,
  },
]

// U holds an ASSIGN permission at T1 stage 2 level 1 only, so joins exist for
// U against every assignment at that stage/level on the pending apps
const EXPECTED_U_JOINS = [
  {
    application_id: APP_ASSIGNED,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_U,
    assignment_org: null,
    assigner_org: null,
  },
  {
    application_id: APP_ASSIGNED,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_V,
    assignment_org: null,
    assigner_org: null,
  },
  {
    application_id: APP_TWO_LEVELS,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_U,
    assignment_org: null,
    assigner_org: null,
  },
  {
    application_id: APP_TWO_LEVELS,
    stage_number: 2,
    level_number: 1,
    reviewer_id: USER_V,
    assignment_org: null,
    assigner_org: null,
  },
]

test('action completes with SUCCESS and updatedApplications output', () => {
  expect(actionResult.status).toBe('SUCCESS')
  expect(actionResult.output).toHaveProperty('updatedApplications')
})

test('grant: U gets an AVAILABLE assignment on a pending application', async () => {
  const rows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.application_id === APP_GRANT
  )
  expect(rows).toEqual([EXPECTED_U_ROWS[0]])
})

test('first-draft application is skipped entirely', async () => {
  expect(await countRows('review_assignment', `application_id = ${APP_FIRST_DRAFT}`)).toBe(0)
})

test('non-PENDING application is untouched', async () => {
  const rows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.application_id === APP_APPROVED
  )
  // U's stale sections restriction would have been rewritten to NULL if the
  // app had been processed
  expect(rows).toEqual([EXPECTED_U_ROWS[1]])
  expect(await countRows('review_assignment', `application_id = ${APP_APPROVED}`)).toBe(2)
})

test('existing ASSIGNED row keeps status; allowed_sections merged across permissions', async () => {
  const rows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.application_id === APP_ASSIGNED
  )
  expect(rows).toEqual([EXPECTED_U_ROWS[2]])
})

test('non-first DRAFT application (changes required) is still processed', async () => {
  const rows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.application_id === APP_DRAFT_LATER
  )
  expect(rows).toEqual([EXPECTED_U_ROWS[3]])
})

test('level capping: rows created only up to highest existing level per application', async () => {
  const uRows = await getUserAssignments(USER_U)
  // APP_ASSIGNED has only level-1 assignments, so no L2 row despite U holding
  // an S2L2 permission
  expect(
    uRows.filter((r: any) => r.application_id === APP_ASSIGNED && r.level_number === 2)
  ).toEqual([])
  // APP_TWO_LEVELS has existing L1+L2 rows, so U gets both levels
  expect(
    uRows.filter((r: any) => r.application_id === APP_TWO_LEVELS).map((r: any) => r.level_number)
  ).toEqual([1, 2, 2])
})

test('org-granted permission creates an org-keyed assignment (separate unique-index path)', async () => {
  const orgRows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.organisation_id === ORG
  )
  expect(orgRows).toEqual([EXPECTED_U_ROWS[6]])
})

test('revoke: assignments deleted where permission no longer exists, review cascaded', async () => {
  const rows = (await getUserAssignments(USER_U)).filter(
    (r: any) => r.application_id === APP_REVOKED
  )
  expect(rows).toEqual([])
  expect(await countRows('review', `id = ${REVIEW_ON_REVOKED}`)).toBe(0)
  // V's assignment on the same application is untouched
  expect(
    await countRows(
      'review_assignment',
      `application_id = ${APP_REVOKED} AND reviewer_id = ${USER_V}`
    )
  ).toBe(1)
})

test('assigner joins created for all assignments at the permitted stage/level', async () => {
  expect(await getUserAssignerJoins(USER_U)).toEqual(EXPECTED_U_JOINS)
})

test('golden snapshot: the full set of U assignment rows', async () => {
  expect(await getUserAssignments(USER_U)).toEqual(EXPECTED_U_ROWS)
})

test('other-user isolation: V rows unchanged, V has no assigner joins', async () => {
  expect(await getUserAssignments(USER_V, { includeIds: true })).toEqual(vPreState)
  expect(await getUserAssignerJoins(USER_V)).toEqual([])
})

test('reviewer stats caches updated for U on changed applications', async () => {
  const statsSettled = await pollUntil(async () => {
    const actions = await getUserReviewerActions(USER_U)
    const forApp = (id: number) => actions.find((a: any) => a.application_id === id)
    return (
      forApp(APP_ASSIGNED)?.assigner_action === 'ASSIGN' &&
      forApp(APP_TWO_LEVELS)?.assigner_action === 'ASSIGN' &&
      forApp(APP_REVOKED) === undefined
    )
  }, 10000)
  expect(statsSettled).toBe(true)
  const actions = await getUserReviewerActions(USER_U)
  // No stats rows for skipped/untouched applications
  expect(actions.find((a: any) => a.application_id === APP_FIRST_DRAFT)).toBeUndefined()
  expect(actions.find((a: any) => a.application_id === APP_APPROVED)).toBeUndefined()
})

// Runs last: re-invoking must be a no-op (excluding time_updated, which the
// legacy implementation bumps on every run). Array parameter form doubles as
// the userId-array test.
test('idempotence: second run (userId as array) changes nothing', async () => {
  const uBefore = await getUserAssignments(USER_U, { includeIds: true })
  const vBefore = await getUserAssignments(USER_V, { includeIds: true })
  const joinsBefore = await getUserAssignerJoins(USER_U)
  const raCount = await countRows('review_assignment', 'application_id BETWEEN 90000 AND 90999')
  const joinCount = await countRows(
    'review_assignment_assigner_join',
    'review_assignment_id IN (SELECT id FROM review_assignment WHERE application_id BETWEEN 90000 AND 90999)'
  )

  const secondResult: any = await refreshReviewAssignments({
    parameters: { userId: [USER_U] },
    DBConnect,
  })
  await drainThrottle()

  expect(secondResult.status).toBe('SUCCESS')
  expect(await getUserAssignments(USER_U, { includeIds: true })).toEqual(uBefore)
  expect(await getUserAssignments(USER_V, { includeIds: true })).toEqual(vBefore)
  expect(await getUserAssignerJoins(USER_U)).toEqual(joinsBefore)
  expect(await countRows('review_assignment', 'application_id BETWEEN 90000 AND 90999')).toBe(
    raCount
  )
  expect(
    await countRows(
      'review_assignment_assigner_join',
      'review_assignment_id IN (SELECT id FROM review_assignment WHERE application_id BETWEEN 90000 AND 90999)'
    )
  ).toBe(joinCount)
})
