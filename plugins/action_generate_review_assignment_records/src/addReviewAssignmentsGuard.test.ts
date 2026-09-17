/**
 * Verifies the guarded upsert in addReviewAssignments: re-generating review
 * assignments for an application must not rewrite rows whose allowed_sections
 * are already correct (an unguarded update fires the section-revalidation and
 * reviewer-stats DB triggers per row -- one all-staff stats job each -- on
 * every application/review submit), while unchanged rows must still be
 * returned so assigner-join generation covers them.
 *
 * Reuses the self-contained fixture from the refresh plugin's test suite.
 * See refreshReviewAssignments.test.ts for environment requirements.
 */
import DBConnect from '../../../src/components/database/databaseConnect'
import { action as generateReviewAssignments } from './index'
import {
  SEED_SQL,
  CLEANUP_SQL,
  USER_U,
  USER_V,
  APP_TWO_LEVELS,
} from '../../action_refresh_review_assignments/src/testHelpers/fixtures'
import {
  drainThrottle,
  getUserAssignments,
  countRows,
} from '../../action_refresh_review_assignments/src/testHelpers/helpers'

jest.setTimeout(120000)

const sortedIds = (result: any) =>
  result.output.levels
    .flatMap((level: any) => level.reviewAssignmentIds)
    .sort((a: number, b: number) => a - b)

beforeAll(async () => {
  await DBConnect.query({ text: CLEANUP_SQL })
  await DBConnect.query({ text: SEED_SQL })
})

// No DBConnect.end() -- see refreshReviewAssignments.test.ts
afterAll(async () => {
  await drainThrottle()
  await DBConnect.query({ text: CLEANUP_SQL })
})

test('regeneration returns unchanged rows without rewriting them', async () => {
  // First run: creates U's missing rows, leaves V's correct rows untouched
  const firstResult: any = await generateReviewAssignments({
    parameters: { applicationId: APP_TWO_LEVELS },
    DBConnect,
  })
  await drainThrottle()
  expect(firstResult.status).toBe('SUCCESS')

  const uAfterFirst = await getUserAssignments(USER_U, {
    includeIds: true,
    includeTimeUpdated: true,
  })
  const vAfterFirst = await getUserAssignments(USER_V, {
    includeIds: true,
    includeTimeUpdated: true,
  })
  const joinCount = await countRows(
    'review_assignment_assigner_join',
    `review_assignment_id IN (SELECT id FROM review_assignment WHERE application_id = ${APP_TWO_LEVELS})`
  )

  // Second run: every assignment already correct -- nothing may be rewritten
  const secondResult: any = await generateReviewAssignments({
    parameters: { applicationId: APP_TWO_LEVELS },
    DBConnect,
  })
  await drainThrottle()
  expect(secondResult.status).toBe('SUCCESS')

  // Unchanged rows are still reported (via the fallback id lookup), so
  // downstream assigner-join generation keeps covering them
  expect(sortedIds(secondResult)).toEqual(sortedIds(firstResult))
  expect(
    await countRows(
      'review_assignment_assigner_join',
      `review_assignment_id IN (SELECT id FROM review_assignment WHERE application_id = ${APP_TWO_LEVELS})`
    )
  ).toBe(joinCount)

  // No row was rewritten: time_updated (bumped by the BEFORE UPDATE trigger
  // on any real update) is byte-identical for both users
  expect(
    await getUserAssignments(USER_U, { includeIds: true, includeTimeUpdated: true })
  ).toEqual(uAfterFirst)
  expect(
    await getUserAssignments(USER_V, { includeIds: true, includeTimeUpdated: true })
  ).toEqual(vAfterFirst)
})
