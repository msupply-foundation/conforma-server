/*
Contains core actions that must be run for the system to function correctly.
These should NEVER be configurable or removable by template configurations, so
they've been hard-coded here in order to:
- be maintained in one place: a change can be made without having to
  re-configure all templates
- prevent accidental misconfiguration or removal
*/

import { Trigger } from '../../generated/graphql'
import { ActionInTemplate } from '../../types'

type CoreActions = {
  [key in Trigger]?: Omit<ActionInTemplate, 'parameters_evaluated'>[]
}

const coreActions: CoreActions = {
  [Trigger.OnApplicationCreate]: [
    // Generate serial for application when first created
    // Can be over-ridden by specifying a template action
    {
      code: 'generateTextString',
      path: '../plugins/action_generate_text_string/src/index.ts',
      name: 'Generate Text String',
      trigger: 'ON_APPLICATION_CREATE',
      event_code: null,
      sequence: -3,
      condition: true,
      parameter_queries: {
        pattern: 'S-[A-Z]{3}-<+dddd>',
        fieldName: 'serial',
        tableName: 'application',
        counterName: {
          operator: 'objectProperties',
          children: ['applicationData.templateCode'],
        },
        updateRecord: true,
      },
    },
    // Set initial stage
    {
      code: 'incrementStage',
      path: '../plugins/action_increment_stage/src/index.ts',
      name: 'Increment Stage',
      trigger: 'ON_APPLICATION_CREATE',
      event_code: null,
      sequence: -2,
      condition: true,
      parameter_queries: {},
    },
    // Generate name for application based on template code and serial
    {
      code: 'generateTextString',
      path: '../plugins/action_generate_text_string/src/index.ts',
      name: 'Generate Text String',
      trigger: 'ON_APPLICATION_CREATE',
      event_code: null,
      // Sequence set high so it goes AFTER template actions
      sequence: 100,
      condition: true,
      parameter_queries: {
        pattern: '<?templateName> - <?serial>',
        fieldName: 'name',
        tableName: 'application',
        customFields: {
          serial: 'applicationData.applicationSerial',
          templateName: 'applicationData.templateName',
        },
        updateRecord: true,
      },
    },
  ],
  [Trigger.OnApplicationRestart]: [
    // Set status = DRAFT
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_APPLICATION_SUBMIT',
      event_code: null,
      sequence: -1,
      condition: true,
      parameter_queries: { newStatus: 'SUBMITTED' },
    },
  ],
  [Trigger.OnApplicationSubmit]: [
    // Set status = SUBMITTED
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_APPLICATION_SUBMIT',
      event_code: null,
      sequence: -5,
      condition: true,
      parameter_queries: { newStatus: 'SUBMITTED' },
    },
    // Trim application responses that haven't changed since previous submission
    {
      code: 'trimResponses',
      path: '../plugins/action_trim_responses/src/index.ts',
      name: 'Trim duplicate responses',
      trigger: 'ON_APPLICATION_SUBMIT',
      event_code: null,
      sequence: -4,
      condition: true,
      parameter_queries: {},
    },
    // Create review assignment records for the next review level
    {
      code: 'generateReviewAssignments',
      path: '../plugins/action_generate_review_assignment_records/src/index.ts',
      name: 'Generate Review Assignment Records',
      trigger: 'ON_APPLICATION_SUBMIT',
      event_code: null,
      sequence: -3,
      condition: true,
      parameter_queries: {},
    },
    // Remove any files that were uploaded but not submitted as part of the
    // application
    {
      code: 'cleanupFiles',
      path: '../plugins/action_files_cleanup/src/index.ts',
      name: 'Clean up application files',
      trigger: 'ON_APPLICATION_SUBMIT',
      event_code: null,
      sequence: -2,
      condition: true,
      parameter_queries: {},
    },
    // Update review statuses
    // TO-DO: Un-comment once action is re-implemented
    // {
    //   code: 'updateReviewStatuses',
    //   path: '../plugins/action_update_review_statuses/src/index.ts',
    //   name: 'Update Review Statuses',
    //   trigger: 'ON_APPLICATION_SUBMIT',
    //   event_code: null,
    //   sequence: -1,
    //   condition: true,
    //   parameter_queries: {
    //     changedResponses: {
    //       operator: 'objectProperties',
    //       children: ['outputCumulative.updatedResponses'],
    //     },
    //   },
    // },
  ],
  [Trigger.OnReviewAssign]: [
    // If any reviews already exist for the current assignment, set them to
    // "DRAFT" (this would happen if the reviewer had been unasssigned and then
    // re-assigned)
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_ASSIGN',
      event_code: null,
      sequence: -1,
      condition: {
        operator: '!=',
        children: [
          {
            operator: 'objectProperties',
            children: ['applicationData.reviewData', null],
          },
          null,
        ],
      },
      parameter_queries: {
        isReview: true,
        newStatus: 'DRAFT',
      },
    },
  ],
  [Trigger.OnReviewCreate]: [
    // Set to DRAFT
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_CREATE',
      event_code: '',
      sequence: -1,
      condition: true,
      parameter_queries: { newStatus: 'DRAFT' },
    },
  ],
  [Trigger.OnReviewRestart]: [
    // Set to DRAFT
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_CREATE',
      event_code: '',
      sequence: -1,
      condition: true,
      parameter_queries: { newStatus: 'DRAFT' },
    },
  ],
  [Trigger.OnReviewSubmit]: [
    // Set review status => SUBMITTED
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: '',
      sequence: -7,
      condition: true,
      parameter_queries: { newStatus: 'SUBMITTED' },
    },

    // Remove any review responses that have not changed since previous review
    {
      code: 'trimResponses',
      path: '../plugins/action_trim_responses/src/index.ts',
      name: 'Trim duplicate review responses',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: '',
      sequence: -6,
      condition: true,
      parameter_queries: {
        operator: 'objectProperties',
        children: ['outputCumulative.reviewStatusHistoryTimestamp'],
      },
    },
    // Update review statuses
    // TO-DO: Un-comment once action is re-implemented
    // {
    //   code: 'updateReviewStatuses',
    //   path: '../plugins/action_update_review_statuses/src/index.ts',
    //   name: 'Update Review Statuses',
    //   trigger: 'ON_REVIEW_SUBMIT',
    //   event_code: null,
    //   sequence: -5,
    //   condition: true,
    //   parameter_queries: {
    //     changedResponses: {
    //       operator: 'objectProperties',
    //       children: ['outputCumulative.updatedResponses'],
    //     },
    //   },
    // },

    // If sent back to applicant for further information (LOQ), this sets which
    // review responses are visible to the applicant
    {
      code: 'updateReviewVisibility',
      path: '../plugins/action_update_review_visibility/src/index.ts',
      name: "Update Applicant's Review Visibility",
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: '',
      sequence: -4,
      condition: {
        operator: 'AND',
        children: [
          {
            operator: '=',
            children: [
              {
                operator: 'objectProperties',
                children: ['applicationData.reviewData.latestDecision.decision'],
              },
              'LIST_OF_QUESTIONS',
            ],
          },
          {
            operator: 'objectProperties',
            children: ['applicationData.reviewData.isLastLevel'],
          },
        ],
      },
      parameter_queries: {},
    },
    // Will always increment stage if and only if last-level decision is
    // "CONFORM". Any other cases for incrementing stage must be specified in
    // template actions.
    {
      code: 'incrementStage',
      path: '../plugins/action_increment_stage/src/index.ts',
      name: 'Increment Stage',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: null,
      sequence: -3,
      condition: {
        operator: 'AND',
        children: [
          {
            operator: 'objectProperties',
            children: ['applicationData.reviewData.isLastLevel'],
          },
          {
            operator: '=',
            children: [
              {
                operator: 'objectProperties',
                children: ['applicationData.reviewData.latestDecision.decision'],
              },
              'CONFORM',
            ],
          },
        ],
      },
      parameter_queries: {},
    },
    // Change status to "CHANGES_REQUIRED" if last level and decision = LOQ
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: null,
      sequence: -2,
      condition: {
        operator: 'AND',
        children: [
          {
            operator: '=',
            children: [
              {
                operator: 'objectProperties',
                children: ['applicationData.reviewData.latestDecision.decision'],
              },
              'LIST_OF_QUESTIONS',
            ],
          },
          {
            operator: 'objectProperties',
            children: ['applicationData.reviewData.isLastLevel'],
          },
        ],
      },
      parameter_queries: {
        isReview: false,
        newStatus: 'CHANGES_REQUIRED',
      },
    },
    // Change outcome accordingly if final level and stage is CONFORM or
    // NON_CONFORM
    {
      code: 'changeOutcome',
      path: '../plugins/action_change_outcome/src/index.ts',
      name: 'Change Outcome',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: null,
      sequence: -1,
      condition: {
        operator: 'OR',
        children: [
          {
            operator: 'AND',
            children: [
              {
                operator: '=',
                children: [
                  {
                    operator: 'objectProperties',
                    children: ['applicationData.reviewData.latestDecision.decision'],
                  },
                  'CONFORM',
                ],
              },
              {
                operator: 'objectProperties',
                children: ['applicationData.reviewData.isLastStage'],
              },
            ],
          },
          {
            operator: 'AND',
            children: [
              {
                operator: '=',
                children: [
                  {
                    operator: 'objectProperties',
                    children: ['applicationData.reviewData.latestDecision.decision'],
                  },
                  'NON_CONFORM',
                ],
              },
              {
                operator: 'objectProperties',
                children: ['applicationData.reviewData.isLastLevel'],
              },
            ],
          },
        ],
      },
      parameter_queries: {
        newOutcome: {
          operator: '?',
          children: [
            {
              operator: '=',
              children: [
                {
                  operator: 'objectProperties',
                  children: ['applicationData.reviewData.latestDecision.decision', null],
                },
                'CONFORM',
              ],
            },
            'APPROVED',
            'REJECTED',
          ],
        },
      },
    },
    // Generate review assignments for next stage/level
    {
      code: 'generateReviewAssignments',
      path: '../plugins/action_generate_review_assignment_records/src/index.ts',
      name: 'Generate Review Assignment Records',
      trigger: 'ON_REVIEW_SUBMIT',
      event_code: null,
      // Needs to go AFTER any possible "incrementStage" action
      sequence: 100,
      condition: true,
      parameter_queries: {},
    },
  ],
  [Trigger.OnReviewUnassign]: [
    // If any reviews for this assignment already exist, then set them to
    // DISCONTINUED
    {
      code: 'changeStatus',
      path: '../plugins/action_change_status/src/index.ts',
      name: 'Change Status',
      trigger: 'ON_REVIEW_UNASSIGN',
      event_code: null,
      sequence: -1,
      condition: {
        operator: '!=',
        children: [
          {
            operator: 'objectProperties',
            children: [
              {
                children: ['applicationData.reviewData.reviewId', null],
                operator: 'objectProperties',
              },
              null,
            ],
          },
          null,
        ],
      },
      parameter_queries: {
        isReview: true,
        newStatus: 'DISCONTINUED',
      },
    },
  ],
}

export default coreActions
