// Test suite for the generateReviewAssignments Action

// NOTE: Just checks that Actions returns expected ouput, doesn't check that
// database has entered correct information

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus, ReviewAssignmentStatus } from '../../../src/generated/graphql'
import { action as generateReviewAssignments } from './index'

// Simulate application submission:

test('Test: Submit Application ID#4001 - Stage 1', () => {
  //stageNumber: 1, stageId: 4, levels: 1
  return generateReviewAssignments({
    parameters: { applicationId: 4001 },
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 2,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 3,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 4,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 5,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 7,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 9,
            orgId: null,
            stageId: 4,
            stageNumber: 1,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
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
    parameters: { templateId: 4, applicationId: 4002 }, // stageNumber: 2, stageId: 5, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 7,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S1'],
            levelNumber: 1,
            isLastLevel: false,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S2'],
            levelNumber: 1,
            isLastLevel: false,
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

// Simulate review submission:

test('Test: Submit Review (Stage 1) for Application ID#4000 => Stage 2 Lvl 1', () => {
  return generateReviewAssignments({
    parameters: { templateId: 4, applicationId: 4000, reviewId: 1000 }, // stageNumber: 2, stageId: 5, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 7,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4000,
            allowedSections: ['S1'],
            levelNumber: 1,
            isLastLevel: false,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4000,
            allowedSections: ['S2'],
            levelNumber: 1,
            isLastLevel: false,
          },
        ],
        reviewAssignmentIds: [1001, 1002],
        reviewAssignmentAssignerJoinIds: [5, 6, 7, 8],
        reviewAssignmentAssignerJoins: [
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1001,
          },
          {
            assignerId: 12,
            orgId: null,
            reviewAssignmentId: 1001,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1002,
          },
          {
            assignerId: 12,
            orgId: null,
            reviewAssignmentId: 1002,
          },
        ],
        nextStageNumber: 2,
        nextReviewLevel: 1,
      },
    })
  })
})

test('Test: Submit Review (Lvl 1 in Stage 2) for Application ID#4002 => Stage 2 Lvl2', () => {
  return generateReviewAssignments({
    parameters: { templateId: 4, applicationId: 4002, reviewId: 4000 }, // stageNumber: 2, stageId: 5, levels: 2
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 9,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4002,
            allowedSections: null,
            levelNumber: 2,
            isLastLevel: true,
          },
          {
            reviewerId: 10,
            orgId: null,
            stageId: 5,
            stageNumber: 2,
            status: ReviewAssignmentStatus.AvailableForSelfAssignment,
            applicationId: 4002,
            allowedSections: null,
            levelNumber: 2,
            isLastLevel: true,
          },
        ],
        reviewAssignmentIds: [1009, 1010],
        reviewAssignmentAssignerJoins: [],
        reviewAssignmentAssignerJoinIds: [],
        nextStageNumber: 2,
        nextReviewLevel: 2,
      },
    })
  })
})
