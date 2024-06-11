import DBConnect from '../components/databaseConnect'
import { errorMessage } from '../components/utilityFunctions'
import config from '../config'

const databaseMethods = {
  getLookupTable: async (id: number) => {
    try {
      // Get table details
      const result = await DBConnect.query({
        text: 'SELECT table_name, field_map FROM data_table WHERE id = $1',
        values: [id],
      })
      const tableName = `${config.dataTablePrefix}${result.rows[0].table_name}`

      // Get table
      const data = await DBConnect.query({ text: `SELECT * FROM ${tableName} ORDER BY id;` })
      return data.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  listLookupTables: async () => {
    const result = await DBConnect.gqlQuery(
      `query getAllLookupTableStructures {
        dataTables(condition: {isLookupTable: true}) {
          nodes {
            id
            tableName
            displayName
            fieldMap
            __typename
            dataViewCode
          }
          __typename
        }
      }
    `
    )
    return result?.dataTables?.nodes
  },
}

export default databaseMethods
