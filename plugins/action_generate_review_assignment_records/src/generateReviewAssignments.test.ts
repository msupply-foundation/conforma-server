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

// Create new reviewAssignments but with locked status since already one is Assigned
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
            reviewerId: 6,
            organisationId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.Assigned,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: false,
          },
          {
            reviewerId: 7,
            organisationId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: true,
          },
          {
            reviewerId: 8,
            organisationId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: true,
          },
          {
            reviewerId: 12,
            organisationId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: true,
          },
          {
            reviewerId: 13,
            organisationId: null,
            stageId: 5,
            stageNumber: 1,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4001,
            allowedSections: null,
            levelNumber: 1,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: true,
          },
        ],
        reviewAssignmentIds: [1005, 1062, 1063, 1064, 1065],
        reviewAssignmentAssignerJoins: [],
        reviewAssignmentAssignerJoinIds: [],
        removedAssignmentIds: [],
        removedAssignmentAssignerIds: [],
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
            reviewerId: 6,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Assigned,
            applicationId: 4002,
            allowedSections: ['S1'],
            levelNumber: 1,
            isLastLevel: false,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: false,
            isLocked: false,
          },
          {
            reviewerId: 7,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Assigned,
            applicationId: 4002,
            allowedSections: ['S2'],
            levelNumber: 1,
            isLastLevel: false,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: false,
            isLocked: false,
          },
          {
            reviewerId: 14,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S1', 'S2'],
            levelNumber: 1,
            isLastLevel: false,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: false,
            isLocked: false,
          },
          {
            reviewerId: 15,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: ['S1', 'S2'],
            levelNumber: 1,
            isLastLevel: false,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: false,
            isLocked: false,
          },
        ],
        reviewAssignmentIds: [1007, 1008, 1068, 1069],
        reviewAssignmentAssignerJoins: [
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 1007,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1007,
          },
          {
            assignerId: 18,
            orgId: null,
            reviewAssignmentId: 1007,
          },
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 1008,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1008,
          },
          {
            assignerId: 18,
            orgId: null,
            reviewAssignmentId: 1008,
          },
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 1068,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1068,
          },
          {
            assignerId: 18,
            orgId: null,
            reviewAssignmentId: 1068,
          },
          {
            assignerId: 10,
            orgId: null,
            reviewAssignmentId: 1069,
          },
          {
            assignerId: 11,
            orgId: null,
            reviewAssignmentId: 1069,
          },
          {
            assignerId: 18,
            orgId: null,
            reviewAssignmentId: 1069,
          },
        ],
        reviewAssignmentAssignerJoinIds: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
        removedAssignmentIds: [],
        removedAssignmentAssignerIds: [],
        nextStageNumber: 2,
        nextReviewLevel: 1,
      },
    })
  })
})

// Recreated test case for First Review submission (Stage 1 - generate assignment for Stage 2)

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
            reviewerId: 8,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.Available,
            applicationId: 4002,
            allowedSections: null,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: true,
          },
          {
            reviewerId: 9,
            organisationId: null,
            stageId: 6,
            stageNumber: 2,
            levelNumber: 2,
            status: ReviewAssignmentStatus.Assigned,
            applicationId: 4002,
            allowedSections: null,
            isLastLevel: true,
            isLastStage: false,
            isFinalDecision: false,
            isSelfAssignable: true,
            isLocked: false,
          },
        ],
        reviewAssignmentIds: [1009, 1010],
        reviewAssignmentAssignerJoinIds: [],
        reviewAssignmentAssignerJoins: [],
        removedAssignmentIds: [],
        removedAssignmentAssignerIds: [],
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

  test('Submit Review ID#7003 for Application ID#4004 - Stage 2 Lvl 2 to create assignments for Stage 3 (Last Stage) - Final Decision', () => {
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
              reviewerId: 16,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 17,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
              isSelfAssignable: true,
              isLocked: false,
            },
          ],
          reviewAssignmentIds: [1072, 1073],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          removedAssignmentIds: [],
          removedAssignmentAssignerIds: [],
          nextStageNumber: 3,
          nextReviewLevel: 1,
        },
      })
    })
  })
})

// Simulate new user added with granted permission to review application:

describe('Re-generate reviewAssignments for application on Stage 1 - Level 1', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public."user" (id, first_name, last_name, username)
        VALUES (100, 'TEST', 'USER', 'TEST_USER');
        INSERT INTO public.permission_join (user_id, permission_name_id, is_active)
        VALUES (100, 9, 'True');
      `,
      values: [],
    })
    done()
  })

  // Re-create review assignment for application with same permissionName on Stage1
  test('Test: Re-create assignments having one more (locked) for Application ID#4001 - Stage 1', () => {
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
              reviewerId: 6,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 7,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: true,
            },
            {
              reviewerId: 8,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: true,
            },
            {
              reviewerId: 12,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: true,
            },
            {
              reviewerId: 13,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: true,
            },
            {
              reviewerId: 100,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: true,
            },
          ],
          reviewAssignmentIds: [1005, 1062, 1063, 1064, 1065, 1079],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          removedAssignmentIds: [],
          removedAssignmentAssignerIds: [],
          nextStageNumber: 1,
          nextReviewLevel: 1,
        },
      })
    })
  })
})

// Simulate user that was assigned has revoked permission to review application:

describe('Re-generate reviewAssignments after revoked permission for application on Stage 1 - Level 1', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `DELETE FROM public.permission_join where user_id = 6 and permission_name_id = 9`,
      values: [],
    })
    done()
  })

  // Re-create review assignment for application with same permissionName on Stage1
  test('Test: Re-create assignments having one less for Application ID#4001 - Stage 1', () => {
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
              reviewerId: 7,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 8,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 12,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 13,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 100,
              organisationId: null,
              stageId: 5,
              stageNumber: 1,
              status: ReviewAssignmentStatus.Available,
              applicationId: 4001,
              allowedSections: null,
              levelNumber: 1,
              isLastLevel: true,
              isLastStage: false,
              isFinalDecision: false,
              isSelfAssignable: true,
              isLocked: false,
            },
          ],
          reviewAssignmentIds: [1062, 1063, 1064, 1065, 1079],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          removedAssignmentIds: [1005],
          removedAssignmentAssignerIds: [],
          nextStageNumber: 1,
          nextReviewLevel: 1,
        },
      })
    })
  })
})

describe('Re-generate reviewAssignments after granted permission for application on Stage 2 - Level 2', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
        INSERT INTO public.permission_join (user_id, permission_name_id, is_active)
        VALUES (100, 13, 'True');
      `,
      values: [],
    })
    done()
  })
  test('Test: Re-create assignments having one more (final decision) for Application ID#4001 - Stage 2 Lvl 2', () => {
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
              reviewerId: 16,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 17,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
              isSelfAssignable: true,
              isLocked: false,
            },
            {
              reviewerId: 100,
              organisationId: null,
              stageId: 7,
              stageNumber: 3,
              levelNumber: 1,
              status: ReviewAssignmentStatus.Assigned,
              applicationId: 4004,
              allowedSections: null,
              isLastLevel: true,
              isLastStage: true,
              isFinalDecision: true,
              isSelfAssignable: true,
              isLocked: false,
            },
          ],
          reviewAssignmentIds: [1072, 1073, 1087],
          reviewAssignmentAssignerJoins: [],
          reviewAssignmentAssignerJoinIds: [],
          removedAssignmentIds: [],
          removedAssignmentAssignerIds: [],
          nextStageNumber: 3,
          nextReviewLevel: 1,
        },
      })
    })
  })
})
