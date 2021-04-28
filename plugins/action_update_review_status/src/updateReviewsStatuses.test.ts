// Test suite for the updateReviews Action.

import DBConnect from '../../../src/components/databaseConnect'
import { action as updateReviewsStatuses } from './index'

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
  done()
})

test('Test: Should update 2 reviews', () => {
  return updateReviewsStatuses({
    parameters: {
      applicationId: 4000,
      changedApplicationResponses: [
        { applicationResponseId: 7, templateElementId: 4005 },
        { applicationResponseId: 9, templateElementId: 4002 },
      ],
    },
    applicationData: { stageId: 6 },
    DBConnect,
  }).then((result: any) => {
    expect(result).toEqual({
      status: 'Success',
      error_log: '',
      output: {
        updatedReviews: [
          {
            reviewId: 2,
            reviewAssignmentId: 1001,
            applicationId: 4000,
            reviewer_id: 6,
            levelNumber: 1,
            reviewStatus: 'Pending',
          },
        ],
      },
    })
  })
})
