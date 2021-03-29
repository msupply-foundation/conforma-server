// data import order and filename generating methods
const defaultGenerateFileName = (record) => String(record.id)

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
    table: 'actionPlugin',
    skip: true,
  },
]

exports.graphQLdefinition = graphQLdefinition
exports.defaultGenerateFileName = defaultGenerateFileName
