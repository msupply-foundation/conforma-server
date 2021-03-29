// data import order and filename generating methods
const defaultGenerateFileName = (record) => String(record.id)

// where is POLICY ?
// where is ENUM trigger

const graphQLdefinition = [
  {
    table: 'user',
    generateFileName: (record) => String(record.id) + '_' + record.username,
  },
  {
    table: 'organisation',
    generateFileName: (record) => String(record.id) + '_' + record.name,
  },
  {
    table: 'userOrganisation',
    generateFileName: (record) =>
      String(record.id) + '_U' + record.userId + '_C' + record.organisationId,
  },
  {
    table: 'permissionPolicy',
    generateFileName: (record) => String(record.id) + '_' + record.name + '_' + record.type,
  },
  {
    table: 'template',
    generateFileName: (record) => String(record.id) + '_' + record.code,
  },
  {
    table: 'templateSection',
    generateFileName: (record) => String(record.id) + '_T' + record.templateId,
  },
  {
    table: 'templateElement',
    generateFileName: (record) => String(record.id) + '_S' + record.sectionId + '_' + record.code,
  },

  {
    table: 'templateStage',
    generateFileName: (record) =>
      String(record.id) + '_T' + record.templateId + '_number' + record.number,
  },
  {
    table: 'permissionName',
    generateFileName: (record) =>
      String(record.id) + '_PP' + record.permissionPolicyId + '_' + record.name,
  },
  {
    table: 'permissionJoin',
    generateFileName: (record) =>
      String(record.id) +
      '_U' +
      record.userId +
      (record.organisationId ? '_O' + record.organisationId : ''),
  },
  {
    table: 'templatePermission',
    generateFileName: (record) =>
      String(record.id) +
      '_T' +
      record.templateId +
      '_PN' +
      record.permissionNameId +
      '_S' +
      record.stageNumber +
      '_L' +
      record.level,
  },
  {
    table: 'templateAction',
    generateFileName: (record) =>
      String(record.id) + '_T' + record.templateId + '_' + record.actionCode + '_' + record.trigger,
  },

  {
    table: 'actionPlugin',
    skip: true,
  },
  {
    table: 'application',
    generateFileName: (record) => String(record.id) + '_' + record.name,
  },
  {
    table: 'applicationSection',
    generateFileName: (record) =>
      String(record.id) + '_A' + record.applicationId + '_TS' + record.templateSectionId,
  },
  {
    table: 'applicationResponse',
    generateFileName: (record) =>
      String(record.id) + '_A' + record.applicationId + '_TE' + record.templateElementId,
  },
  {
    table: 'applicationStageHistory',
    generateFileName: (record) =>
      String(record.id) + '_A' + record.applicationId + '_S' + record.stageId,
  },
  {
    table: 'applicationStatusHistory',
    generateFileName: (record) =>
      String(record.id) +
      '_A' +
      record.applicationId +
      '_ASH' +
      record.applicationStageHistoryId +
      '_' +
      record.status,
  },
  {
    table: 'reviewAssignment',
    generateFileName: (record) =>
      String(record.id) +
      '_A' +
      record.applicationId +
      '_RA' +
      record.reviewAssignmentId +
      '_U' +
      record.reviewerId +
      (record.organisationId ? '_O' + record.organisationId : '') +
      '_S' +
      record.stageNumber +
      '_L' +
      record.level,
  },
  {
    table: 'reviewQuestionAssignment',
    generateFileName: (record) =>
      String(record.id) + '_RA' + record.reviewAssignmentId + '_TE' + record.templateElementId,
  },
  {
    table: 'review',
    generateFileName: (record) =>
      String(record.id) +
      '_A' +
      record.applicationId +
      '_RA' +
      record.reviewAssignmentId +
      '_U' +
      record.reviewerId,
  },
  {
    table: 'reviewStatusHistory',
    generateFileName: (record) => String(record.id) + '_R' + record.reviewId + '_' + record.status,
  },
  {
    table: 'reviewDecision',
    generateFileName: (record) => String(record.id) + '_R' + record.reviewId,
  },
  {
    table: 'reviewResponse',
    generateFileName: (record) =>
      String(record.id) +
      '_R' +
      record.reviewId +
      '_RQA' +
      record.reviewQuestionAssignmentId +
      '_AR' +
      record.applicationResponseId,
  },
]

exports.graphQLdefinition = graphQLdefinition
exports.defaultGenerateFileName = defaultGenerateFileName
