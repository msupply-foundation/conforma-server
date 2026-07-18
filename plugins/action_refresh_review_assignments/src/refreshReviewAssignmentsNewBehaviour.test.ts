/**
 * Tests for DELIBERATE behavioral improvements of the set-based user-scoped
 * refresh implementation (they did not hold for the legacy per-application
 * implementation it replaced):
 *  1. Stale assigner joins are deleted when the user holds no ASSIGN
 *     permission (legacy never cleaned them — old TO-DO).
 *  2. Other users' rows are never touched (legacy incidentally regenerated
 *     other users' missing rows on every application it visited).
 *  3. Strict idempotence: a repeat run rewrites nothing, not even
 *     time_updated (legacy bumped it on every conflicting row).
 *  4. NULL-dominant allowed_sections merge: any unrestricted permission =>
 *     unrestricted assignment (legacy merge was order-dependent and could
 *     mask NULL with a restricted row).
 *  5. A genuinely new assignment row always starts AVAILABLE, even when the
 *     same user holds an ASSIGNED row in a different org context at the same
 *     level (legacy's org-blind matching copied ASSIGNED onto the new row,
 *     creating an assignment with no assigned sections).
 *
 * See refreshReviewAssignments.test.ts for environment requirements.
 */
import DBConnect from '../../../src/components/database/databaseConnect'
import { action as refreshReviewAssignments } from './index'
import {
  NB_SEED_SQL,
  CLEANUP_SQL,
  NB_USER_U,
  NB_USER_V,
  NB_ORG,
  NB_T,
  NB_STAGE,
  NB_LEVEL,
  NB_APP_STALE_JOIN,
  NB_APP_INCONSISTENT,
  NB_APP_ASSIGNED,
  T0_LITERAL,
} from './testHelpers/fixtures'
import {
  drainThrottle,
  getUserAssignments,
  getUserAssignerJoins,
  countRows,
} from './testHelpers/helpers'

jest.setTimeout(120000)

describe('set-based refresh: new-behaviour guarantees', () => {
  let vPreState: any[]

  beforeAll(async () => {
    await DBConnect.query({ text: CLEANUP_SQL })
    await DBConnect.query({ text: NB_SEED_SQL })
    vPreState = await getUserAssignments(NB_USER_V, { includeIds: true, includeTimeUpdated: true })
    await refreshReviewAssignments({ parameters: { userId: NB_USER_U }, DBConnect })
    await drainThrottle()
  })

  // No DBConnect.end() -- see refreshReviewAssignments.test.ts
  afterAll(async () => {
    await drainThrottle()
    await DBConnect.query({ text: CLEANUP_SQL })
  })

  const baseRow = {
    stage_number: 1,
    level_number: 1,
    reviewer_id: NB_USER_U,
    status: 'AVAILABLE',
    allowed_sections: null as string[] | null,
    assigned_sections: null as string[] | null,
    is_last_level: true,
    is_last_stage: true,
    is_final_decision: false,
    is_self_assignable: false,
    template_id: NB_T,
    stage_id: NB_STAGE,
    level_id: NB_LEVEL,
    time_stage_created: T0_LITERAL,
  }

  const EXPECTED_U_ROWS = [
    { ...baseRow, application_id: NB_APP_STALE_JOIN, organisation_id: null },
    { ...baseRow, application_id: NB_APP_STALE_JOIN, organisation_id: NB_ORG },
    { ...baseRow, application_id: NB_APP_INCONSISTENT, organisation_id: null },
    { ...baseRow, application_id: NB_APP_INCONSISTENT, organisation_id: NB_ORG },
    {
      ...baseRow,
      application_id: NB_APP_ASSIGNED,
      organisation_id: null,
      status: 'ASSIGNED',
      assigned_sections: ['a'],
    },
    { ...baseRow, application_id: NB_APP_ASSIGNED, organisation_id: NB_ORG },
  ]

  test('NULL-dominant merge: unrestricted + restricted permissions => unrestricted', async () => {
    const rows = (await getUserAssignments(NB_USER_U)).filter(
      (r: any) => r.application_id === NB_APP_STALE_JOIN && r.organisation_id === null
    )
    expect(rows).toEqual([EXPECTED_U_ROWS[0]])
  })

  test('stale assigner joins are deleted when no ASSIGN permission exists', async () => {
    expect(await getUserAssignerJoins(NB_USER_U)).toEqual([])
  })

  test('other users are never touched: no drift repair, no rewrites', async () => {
    // Legacy would have created V's missing assignment on the inconsistent app
    expect(
      await countRows(
        'review_assignment',
        `application_id = ${NB_APP_INCONSISTENT} AND reviewer_id = ${NB_USER_V}`
      )
    ).toBe(0)
    // V's existing rows are byte-identical, including time_updated
    expect(
      await getUserAssignments(NB_USER_V, { includeIds: true, includeTimeUpdated: true })
    ).toEqual(vPreState)
  })

  test('new org-context row starts AVAILABLE even when user is ASSIGNED in another context', async () => {
    const rows = (await getUserAssignments(NB_USER_U)).filter(
      (r: any) => r.application_id === NB_APP_ASSIGNED
    )
    expect(rows).toEqual([EXPECTED_U_ROWS[4], EXPECTED_U_ROWS[5]])
  })

  test('golden snapshot: the full set of U assignment rows', async () => {
    expect(await getUserAssignments(NB_USER_U)).toEqual(EXPECTED_U_ROWS)
  })

  test('strict idempotence: repeat run rewrites nothing, including time_updated', async () => {
    const before = await getUserAssignments(NB_USER_U, {
      includeIds: true,
      includeTimeUpdated: true,
    })
    await refreshReviewAssignments({ parameters: { userId: NB_USER_U }, DBConnect })
    await drainThrottle()
    expect(
      await getUserAssignments(NB_USER_U, { includeIds: true, includeTimeUpdated: true })
    ).toEqual(before)
  })
})
