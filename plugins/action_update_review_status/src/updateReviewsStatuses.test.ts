// Test suite for the updateReviews Action.

import DBConnect from '../../../src/components/databaseConnect'
import { ActionQueueStatus, Decision, ReviewStatus } from '../../../src/generated/graphql'
import { action as updateReviewsStatuses } from './index'

describe('Duplicate application responses for re-submission with 2 modifications', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4001, 4001, '{"text": "Valerio"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4002, 4001, '{"text": "Red"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4003, 4001, '{"text": "jj@nowhere.com"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4005, 4001, '{"text": "42"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4006, 4001, '{"text": "Tonga"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4008, 4001, '{"text": "Vitamin B"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4009, 4001, '{"text": "Natural Product", "optionIndex": 1}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4011, 4001, '{"text": "100mg"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4012, 4001, '{"text": "250"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_submitted)
      VALUES (DEFAULT, 4013, 4001, '{"text": "Nausea"}', 'True', 'NOW()');
  `,
      values: [],
    })
    done()
  })

  test('Application resubmitted with changes => Update review status to PENDING', () => {
    return updateReviewsStatuses({
      parameters: {
        // triggeredBy: 'APPLICATION',
        changedResponses: [
          { applicationResponseId: 4018, templateElementId: 4012 },
          { applicationResponseId: 4019, templateElementId: 4013 },
        ],
      },
      // @ts-ignore -- ignore missing properties on applicationData
      applicationData: {
        applicationId: 4001,
        stageId: 5,
      },
      DBConnect,
    }).then((result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: [
            {
              reviewId: 6001,
              reviewAssignmentId: 1005,
              applicationId: 4001,
              reviewerId: 7,
              levelNumber: 1,
              reviewStatus: ReviewStatus.Pending,
            },
          ],
          updatedReviewAssignments: [],
        },
      })
    })
  })
})

describe('Update review_response to required changes_requested by consolidator1', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      INSERT INTO public.review_response (id, review_id, review_question_assignment_id, template_element_id, application_response_id, decision, status)
        VALUES (DEFAULT, 5003, 1022, 4001, 4000, 'DISAGREE', 'SUBMITTED');
      INSERT INTO public.review_decision (id, decision, review_id)
        VALUES (DEFAULT, 'CHANGES_REQUESTED', 5003);
      INSERT INTO public.review_status_history (id, review_id, status)
        VALUES (DEFAULT, 5003, 'SUBMITTED');
      `,
      values: [],
    })
    done()
  })

  test('Review submitted to lower level with changes required => Update lower review status to CHANGES_REQUESTED', () => {
    return updateReviewsStatuses({
      parameters: {
        triggeredBy: 'REVIEW',
        changedResponses: [
          {
            applicationResponseId: 4000,
            templateElementId: 4001,
            reviewResponseDecision: 'DISAGREE',
          },
        ],
      },
      // @ts-ignore -- ignore missing properties on applicationData
      applicationData: {
        applicationId: 4000,
        stageId: 6,
        reviewData: {
          reviewId: 5003,
          levelNumber: 2,
          isLastLevel: true,
          latestDecision: { decision: Decision.ChangesRequested, comment: null },
        },
      },
      DBConnect,
    }).then((result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: [
            {
              reviewId: 5001,
              reviewAssignmentId: 1001,
              applicationId: 4000,
              reviewerId: 7,
              levelNumber: 1,
              reviewStatus: ReviewStatus.ChangesRequested,
            },
          ],
          updatedReviewAssignments: [],
        },
      })
    })
  })
})

describe('Update review_responses after updating changes_requested to reviewer1', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
    INSERT INTO public.review_response (id, review_id, review_question_assignment_id, template_element_id, application_response_id, decision, status)
      VALUES (DEFAULT, 6003, 3010, 4001, 4020, 'APPROVE', 'SUBMITTED');
    INSERT INTO public.review_response (id, review_id, review_question_assignment_id, template_element_id, application_response_id, decision, status)
      VALUES (DEFAULT, 6003, 3011, 4002, 4021, 'APPROVE', 'SUBMITTED');
    UPDATE public.review_decision SET decision = 'CONFORM', comment = NULL, time_updated = 'NOW()' WHERE id = 6002;
    INSERT INTO public.review_status_history (id, review_id, status)
      VALUES (DEFAULT, 6003, 'SUBMITTED');
    `,
      values: [],
    })
    done()
  })

  test('Review resubmitted to upper level with updated changes => Update upper review status to PENDING', () => {
    return updateReviewsStatuses({
      parameters: {
        triggeredBy: 'REVIEW',
        changedResponses: [
          { applicationResponseId: 4020, templateElementId: 4001 },
          { applicationResponseId: 4021, templateElementId: 4002 },
        ],
      },
      // @ts-ignore -- ignore missing properties on applicationData
      applicationData: {
        applicationId: 4002,
        stageId: 6,
        reviewData: {
          reviewId: 6003,
          levelNumber: 1,
          isLastLevel: false,
        },
      },
      DBConnect,
    }).then((result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: [
            {
              reviewId: 6005,
              reviewAssignmentId: 1010,
              applicationId: 4002,
              reviewerId: 10,
              levelNumber: 2,
              reviewStatus: ReviewStatus.Pending,
            },
          ],
          updatedReviewAssignments: [],
        },
      })
    })
  })
})

describe('Update review_response to submit review with LOQ to applicant by consolidator2', () => {
  // Setup database
  beforeAll(async (done) => {
    await DBConnect.query({
      text: `
      UPDATE public.review_response SET is_visible_to_applicant = 'True' WHERE id = 4000;
      UPDATE public.review_response SET (status, decision) = ('SUBMITTED', 'AGREE') WHERE id = 5029;
      UPDATE public.review_decision SET decision = 'LIST_OF_QUESTIONS' WHERE review_id = 6005;
      INSERT INTO public.review_status_history (id, review_id, status)
        VALUES (DEFAULT, 6005, 'SUBMITTED');
      `,
      values: [],
    })
    done()
  })

  test('Consolidation submitted Application ID#4002 to applicant with LOQ => Lock other lower review assignments', () => {
    return updateReviewsStatuses({
      parameters: {
        triggeredBy: 'REVIEW',
        changedResponses: [],
      },
      // @ts-ignore -- ignore missing properties on applicationData
      applicationData: {
        applicationId: 4002,
        stageId: 6,
        reviewData: {
          reviewId: 6005,
          levelNumber: 2,
          isLastLevel: true,
          latestDecision: { decision: Decision.ListOfQuestions, comment: null },
        },
      },
      DBConnect,
    }).then((result: any) => {
      expect(result).toEqual({
        status: ActionQueueStatus.Success,
        error_log: '',
        output: {
          updatedReviews: [],
          updatedReviewAssignments: [
            {
              reviewAssignmentId: 1008,
              isLocked: true,
            },
          ],
        },
      })
    })
  })
})
