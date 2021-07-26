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

test('Test: Submit Application ID#4001 - Stage 1 (Last level)', () => {
  //stageNumber: 1, stageId: 5, levels: 1
  return generateReviewAssignments({
    parameters: { applicationId: 4001 },
    DBConnect,
  }).then((result: any) => {
    expect(clearResult(result)).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 2,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 3,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 4,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 5,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 7,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 9,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isFinalDecision: false,
          },
        ],
        reviewAssignmentIds: [1, 2, 3, 4, 1005, 6, 7],
        reviewAssignmentAssignerJoins: [],
        reviewAssignmentAssignerJoinIds: [],
        nextStageNumber: 1,
        nextReviewLevel: 1,
      },
    })
  })
})

test('Test: Submit Application ID#4002 - Stage 2 Lvl1', () => {
  return generateReviewAssignments({
    parameters: { templateId: 4, applicationId: 4002 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(clearResult(result)).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 7,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S1'],
            levelNumber: 1,
            isLastLevel: false,
            isFinalDecision: false,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S2'],
            levelNumber: 1,
            isLastLevel: false,
            isFinalDecision: false,
          },
        ],
        reviewAssignmentIds: [1007, 1008],
        reviewAssignmentAssignerJoins: [
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1007,
          },
          {
            assignerId: 12,
            orgId: null,
            reviewAssignmentId: 1007,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1008,
          },
          {
            assignerId: 12,
            orgId: null,
            reviewAssignmentId: 1008,
          },
        ],
        reviewAssignmentAssignerJoinIds: [1, 2, 3, 4],
        nextStageNumber: 2,
        nextReviewLevel: 1,
      },
    })
  })
})

// Recreated test case for First Review submissiion (Stage 1 - generate assignment for Stage 2)

// Simulate review submission:

test('Test: Submit Review ID#6003 for Application ID#4002 - Stage 2 Lvl 1 to update existing level 2 assignment', () => {
  return generateReviewAssignments({
    parameters: { templateId: 4, applicationId: 4002, reviewId: 6003 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(clearResult(result)).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 9,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4002,
            allowedSections: null,
            isLastLevel: true,
            isFinalDecision: false,
          },
          {
            reviewerId: 10,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4002,
            allowedSections: null,
            isLastLevel: true,
            isFinalDecision: false,
          },
        ],
        reviewAssignmentIds: [1009, 1010],
        reviewAssignmentAssignerJoinIds: [],
        reviewAssignmentAssignerJoins: [],
        nextStageNumber: 2,
        nextReviewLevel: 2,
      },
    })
  })
})

describe('Move Review to next stage (Final Decision) before generation of reviewAssignments', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public.review_decision (id, decision, review_id)
        VALUES (DEFAULT, 'NON_CONFORM', 7004);
      INSERT INTO public.review_status_history (id, review_id, status)
        VALUES (DEFAULT, 7004, 'SUBMITTED'); 
      INSERT INTO public.application_stage_history (id, application_id, stage_id, is_current)
        VALUES (1000, 4004, 7, 'True');
      INSERT INTO public.application_status_history (id, application_stage_history_id, status, is_current)
        VALUES (DEFAULT, 1000, 'SUBMITTED', 'True'); 
      `,
      values: [],
    })
    done()
  })

  test('Submit Review ID#7003 for Application ID#4004 - Stage 2 Lvl 2 to create assignments for Stage 3 (Fina Decision)', () => {
    return generateReviewAssignments({
      parameters: { templateId: 4, applicationId: 4004, reviewId: 7004 }, // stageNumber: 2, stageId: 7, levels: 2
      DBConnect,
    }).then((result: any) => {
      expect(clearResult(result)).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          reviewAssignments: [
            {
              reviewerId: 17,
              orgId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isFinalDecision: true,
            },
            {
              reviewerId: 18,
              orgId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
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
