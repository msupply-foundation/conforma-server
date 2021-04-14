// Test suite for the generateReviewAssignments Action

// NOTE: Just checks that Actions returns expected ouput, doesn't check that
// database has entered correct information

import DBConnect from '../../../components/databaseConnect'

const Action = require('./generateReviewAssignments')

// Simulate application submission:

test('Test: Submit Application ID#4001 - Stage 1', () => {
  return Action.generateReviewAssignments(
    { templateId: 4, applicationId: 4001 }, //stageNumber: 1, stageId: 5, levels: 1
    DBConnect
  ).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 6,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: 'Available',
            applicationId: 4001,
            templateSectionRestrictions: ['S1'],
            level: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 7,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: 'Available',
            applicationId: 4001,
            templateSectionRestrictions: ['S1', 'S2'],
            level: 1,
            isLastLevel: true,
          },
          {
            reviewerId: 8,
            orgId: null,
            stageId: 5,
            stageNumber: 1,
            status: 'Available',
            applicationId: 4001,
            templateSectionRestrictions: ['S2'],
            level: 1,
            isLastLevel: true,
          },
        ],
        reviewAssignmentIds: [1005, 2, 3],
        reviewAssignmentAssignerJoins: [
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 1005,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1005,
          },
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 2,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 2,
          },
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 3,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 3,
          },
        ],
        reviewAssignmentAssignerJoinIds: [1, 2, 3, 4, 5, 6],
        nextStageNumber: 1,
        nextReviewLevel: 1,
      },
    })
  })
})

test('Test: Submit Application ID#4002 - Stage 2 Lvl1', () => {
  return Action.generateReviewAssignments(
    { templateId: 4, applicationId: 4002 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect
  ).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 6,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available',
            applicationId: 4002,
            templateSectionRestrictions: null,
            level: 1,
            isLastLevel: false,
          },
          {
            reviewerId: 7,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available',
            applicationId: 4002,
            templateSectionRestrictions: null,
            level: 1,
            isLastLevel: false,
          },
        ],
        reviewAssignmentIds: [1007, 1008],
        reviewAssignmentAssignerJoins: [],
        reviewAssignmentAssignerJoinIds: [],
        nextStageNumber: 2,
        nextReviewLevel: 1,
      },
    })
  })
})

// Simulate review submission:

test('Test: Submit Review (Stage 1) for Application ID#4000 - Stage 2 Lvl 1', () => {
  return Action.generateReviewAssignments(
    { templateId: 4, applicationId: 4000, reviewId: 1000 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect
  ).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 6,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available',
            applicationId: 4000,
            templateSectionRestrictions: null,
            level: 1,
            isLastLevel: false,
          },
          {
            reviewerId: 7,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available',
            applicationId: 4000,
            templateSectionRestrictions: null,
            level: 1,
            isLastLevel: false,
          },
        ],
        reviewAssignmentIds: [1001, 1002],
        reviewAssignmentAssignerJoins: [],
        reviewAssignmentAssignerJoinIds: [],
        nextStageNumber: 2,
        nextReviewLevel: 1,
      },
    })
  })
})

test('Test: Submit Review  (Stage 2) for Application ID#4002, S2 Lvl2', () => {
  return Action.generateReviewAssignments(
    { templateId: 4, applicationId: 4002, reviewId: 4000 }, // stageNumber: 2, stageId: 6, levels: 2
    DBConnect
  ).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewAssignments: [
          {
            reviewerId: 8,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available for self-assignment',
            applicationId: 4002,
            templateSectionRestrictions: null,
            level: 2,
            isLastLevel: true,
          },
          {
            reviewerId: 9,
            orgId: null,
            stageId: 6,
            stageNumber: 2,
            status: 'Available for self-assignment',
            applicationId: 4002,
            templateSectionRestrictions: null,
            level: 2,
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
