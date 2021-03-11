// Test suite for the updateReviews Action.

import DBConnect from '../../../components/databaseConnect'

const Action = require('./updateReviews')

// Setup database
beforeAll(async (done) => {
  // Duplicate application responses, with some modifications
  await DBConnect.query({
    text: `
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4013, 4000, '{"text": "Turning orange"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4012, 4000, '{"text": "100"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4011, 4000, '{"text": "50mg"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4009, 4000, '{"text": "Natural Product", "optionIndex": 1}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4008, 4000, '{"text": "Vitamin C"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4006, 4000, '{"text": "New Zealand"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4005, 4000, '{"text": "49"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4003, 4000, '{"text": "js@nowhere.com"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4002, 4000, '{"text": "Smithie"}', 'True', 'NOW()');
    INSERT INTO public.application_response (id, template_element_id, application_id, "value", is_valid, time_updated) VALUES (DEFAULT, 4001, 4000, '{"text": "John"}', 'True', 'NOW()');
  `,
    values: [],
  })
  // Duplicate review responses, with some modifications
  // await DBConnect.query({
  //   text: `
  //   INSERT INTO "public".review_response (id, "comment", decision, review_question_assignment_id, application_response_id, review_response_link_id, review_id, time_updated, status) VALUES (DEFAULT, NULL, 'Approve', 1015, 4024, NULL, 5, 'NOW()', 'Submitted');
  //   INSERT INTO "public".review_response (id, "comment", decision, review_question_assignment_id, application_response_id, review_response_link_id, review_id, time_updated, status) VALUES (DEFAULT, NULL, 'Approve', 1014, 4023, NULL, 5, 'NOW()', 'Submitted');
  //   INSERT INTO "public".review_response (id, "comment", decision, review_question_assignment_id, application_response_id, review_response_link_id, review_id, time_updated, status) VALUES (DEFAULT, NULL, 'Approve', 1013, 4022, NULL, 5, 'NOW()', 'Submitted');
  //   INSERT INTO "public".review_response (id, "comment", decision, review_question_assignment_id, application_response_id, review_response_link_id, review_id, time_updated, status) VALUES (DEFAULT, 'This is still not right', 'Decline', 1012, 4021, NULL, 5, 'NOW()', 'Submitted');
  //   INSERT INTO "public".review_response (id, "comment", decision, review_question_assignment_id, application_response_id, review_response_link_id, review_id, time_updated, status) VALUES (DEFAULT, NULL, 'Approve', 1011, 4020, NULL, 5, 'NOW()', 'Submitted');`,
  //   values: [],
  // })
  done()
})

test('Test: Should update 2 reviews', () => {
  return Action.updateReviews(
    { applicationId: 4000, changedApplicationResponses: [7, 9] },
    DBConnect
  ).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        reviewsToUpdate: [
          {
            reviewId: 1,
            reviewAssignmentId: 1000,
            applicationId: 4000,
            reviewer_id: 6,
            level: 1,
            reviewStatus: 'Pending',
          },
          {
            reviewId: 2,
            reviewAssignmentId: 1001,
            applicationId: 4000,
            reviewer_id: 6,
            level: 1,
            reviewStatus: 'Pending',
          },
        ],
      },
    })
  })
})
