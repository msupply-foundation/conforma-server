// TODO
// - filter ? (to be used in export of specific template, or parts of)
// - how to export without IDs (and make sure ID's are added when mutation executes)
// - tableSelector method (if exists use it to see if table should be included in the snapshot
const graphQLdefinition = [
  {
    table: 'user',
  },
  {
    table: 'organisation',
  },
  {
    table: 'userOrganisation',
  },
  {
    table: 'permissionPolicy',
  },
  {
    table: 'template',
  },
  {
    table: 'templateSection',
  },
  {
    table: 'templateElement',
  },

  {
    table: 'templateStage',
  },
  {
    table: 'permissionName',
  },
  {
    table: 'permissionJoin',
  },
  {
    table: 'templatePermission',
  },
  {
    table: 'templateAction',
  },
  {
    table: 'application',
  },
  {
    table: 'applicationSection',
  },
  {
    table: 'applicationResponse',
  },
  {
    table: 'applicationStageHistory',
  },
  {
    table: 'applicationStatusHistory',
    generatedColumns: ['applicationId'],
  },
  {
    table: 'reviewAssignment',
  },
  {
    table: 'reviewAssignmentAssignerJoin',
  },
  {
    table: 'reviewQuestionAssignment',
  },
  {
    table: 'review',
    generatedColumns: ['applicationId', 'reviewerId', 'level', 'isLastLevel'],
  },
  {
    table: 'reviewStatusHistory',
  },
  {
    table: 'reviewDecision',
  },
  {
    table: 'reviewResponse',
  },

  {
    table: 'actionPlugin',
    skip: true,
  },
  {
    table: 'actionQueue',
    skip: true,
  },
  {
    table: 'applicationListShape',
    skip: true,
  },
  {
    table: 'elementTypePlugin',
    skip: true,
  },
  {
    table: 'file',
    skip: true,
  },
  {
    table: 'notification',
    skip: true,
  },
  {
    table: 'trigger_queue',
    skip: true,
  },
]

exports.graphQLdefinition = graphQLdefinition
