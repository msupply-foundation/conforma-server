// Test suite for the generateReviewAssignments Action

// NOTE: Just checks that Actions returns expected ouput, doesn't check that
// database has entered correct information

import { map, omit } from 'lodash'
import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus, ReviewAssignmentStatus } from '../../../src/generated/graphql'
import { action as generateReviewAssignments } from './index'

const removeTimeStageCreated = (reviewAssignment: any) =>
  omit(reviewAssignment, ['timeStageCreated'])

const clearResult = (result: any) => ({
  ...result,
  output: {
    ...result.output,
    reviewAssignments: map(result.output.reviewAssignments, removeTimeStageCreated),
  },
})

// Simulate application submission:

// Show that reviewAssignments don't get created if already existing
test('Test: Submit Application ID#4001 - Stage 1 (Last level) - reviewAssignments already existing', () => {
  //stageNumber: 1, stageId: 5, levels: 1
  return generateReviewAssignments({
    parameters: { applicationId: 4001 },
    DBConnect,
  }).then((result: any) => {
    expect(clearResult(result)).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [],
      },
    })
  })
})

describe('Submit new application on first stage to generate reviewAssignments on Stage 1', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public.application (id, serial, template_id, name, outcome, user_id, org_id)
        VALUES (1000, 'DFG123', 5, 'Test', 'PENDING', 5, 1);
      INSERT INTO public.application_stage_history (id, application_id, stage_id, is_current)
        VALUES (1000, 1000, 5, 'True');
      INSERT INTO public.application_status_history (id, application_stage_history_id, status, is_current)
        VALUES (DEFAULT, 1000, 'SUBMITTED', 'True');
      `,
      values: [],
    })
    done()
  })

  test('Test: Submit Application ID#1000 - Stage 1 Lvl 1 (last level)', () => {
    //stageNumber: 1, stageId: 5, levels: 1
    return generateReviewAssignments({
      parameters: { applicationId: 1000 },
      DBConnect,
    }).then((result: any) => {
      expect(clearResult(result)).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments: [
            {
              reviewerId: 2,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 3,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 4,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 5,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 7,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 8,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 9,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.AvailableForSelfAssignment,
              applicationId: 1000,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
            },
          ],
          reviewAssignmentIds: [1, 2, 3, 4, 5, 6, 7],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          nextStageNumber: 1,
          nextReviewLevel: 1,
        },
      })
    })
  })
})

describe('Re-submit new application on second stage to generate new reviewAssignments on Stage 2', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public.application_stage_history (id, application_id, stage_id, is_current)
        VALUES (1001, 1000, 6, 'True');
      INSERT INTO public.application_status_history (id, application_stage_history_id, status, is_current)
        VALUES (DEFAULT, 1001, 'SUBMITTED', 'True');
      `,
      values: [],
    })
    done()
  })

  test('Test: Submit Application ID#1000 - Stage 2 Lvl1', () => {
    return generateReviewAssignments({
      parameters: { applicationId: 1000 }, // stageNumber: 2, stageId: 6, levels: 2
      DBConnect,
    }).then((result: any) => {
      expect(clearResult(result)).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments: [
            {
              reviewerId: 7,
              organisationId: null,
              stageId: 6,
              stageNumber: 2,
              status: ReviewAssignmentStatus.Available,
              applicationId: 1000,
              allowedSections: ['S1'],
              levelNumber: 1,
              isLastLevel: false,
              isLastStage: false,
              isFinalDecision: false,
            },
            {
              reviewerId: 8,
              organisationId: null,
              stageId: 6,
              stageNumber: 2,
              status: ReviewAssignmentStatus.Available,
              applicationId: 1000,
              allowedSections: ['S2'],
              levelNumber: 1,
              isLastLevel: false,
              isLastStage: false,
              isFinalDecision: false,
            },
          ],
          reviewAssignmentIds: [8, 9],
          reviewAssignmentAssignerJoins: [
            {
              assignerId: 11,
              orgId: null,
              reviewAssignmentId: 8,
            },
            {
              assignerId: 12,
              orgId: null,
              reviewAssignmentId: 8,
            },
            {
              assignerId: 11,
              orgId: null,
              reviewAssignmentId: 9,
            },
            {
              assignerId: 12,
              orgId: null,
              reviewAssignmentId: 9,
            },
          ],
          reviewAssignmentAssignerJoinIds: [1, 2, 3, 4],
          nextStageNumber: 2,
          nextReviewLevel: 1,
        },
      })
    })
  })
})

// Simulate review submission:

test('Test: Submit Review ID#7002 for Application ID#4003 - Stage 2 Lvl 1 to generate level 2 assignments', () => {
  return generateReviewAssignments({
    parameters: { applicationId: 4003, reviewId: 7002 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(clearResult(result)).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 9,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4003,
            allowedSections: null,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
          },
          {
            reviewerId: 10,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4003,
            allowedSections: null,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
          },
        ],
        reviewAssignmentIds: [10, 11],
        reviewAssignmentAssignerJoinIds: [],
        reviewAssignmentAssignerJoins: [],
        nextStageNumber: 2,
        nextReviewLevel: 2,
      },
    })
  })
})

describe('Create new Review to simulate application moving to last stage (Final Decision) to check generation reviewAssignments', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public.review (id, review_assignment_id)
        VALUES (8000, 10);
      INSERT INTO public.review_decision (id, decision, review_id)
        VALUES (DEFAULT, 'NON_CONFORM', 8000);
      INSERT INTO public.review_status_history (id, review_id, status)
        VALUES (DEFAULT, 8000, 'SUBMITTED');
      INSERT INTO public.application_stage_history (id, application_id, stage_id, is_current)
        VALUES (2000, 4003, 7, 'True');
      INSERT INTO public.application_status_history (id, application_stage_history_id, status, is_current)
        VALUES (DEFAULT, 2000, 'SUBMITTED', 'True');
      `,
      values: [],
    })
    done()
  })

  test('Submit Review ID#8000 for Application ID#4004 - Stage 2 Lvl 2 to create assignments for Stage 3 (Last Stage) - Final Decision', () => {
    return generateReviewAssignments({
      parameters: { templateId: 4, applicationId: 4003, reviewId: 8000 }, // stageNumber: 2, stageId: 7, levels: 2
      DBConnect,
    }).then((result: any) => {
      expect(clearResult(result)).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments: [
            {
              reviewerId: 17,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4003,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
            },
            {
              reviewerId: 18,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4003,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
            },
          ],
          reviewAssignmentIds: [12, 13],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          nextStageNumber: 3,
          nextReviewLevel: 1,
        },
      })
    })
  })
})
