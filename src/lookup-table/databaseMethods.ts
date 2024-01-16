import DBConnect from '../components/databaseConnect'
import { errorMessage } from '../components/utilityFunctions'
import config from '../config'

const databaseMethods = {
  getLookupTable: async (id: number) => {
    try {
      // Get table details
      const result = await DBConnect.query({
        text: 'SELECT table_name FROM data_table WHERE id = $1',
        values: [id],
      })
      const table_name = `${config.dataTablePrefix}${result.rows[0].table_name}`

      // Get table
      const data = await DBConnect.query({ text: `SELECT * FROM ${table_name}` })
      return data.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
}

export default databaseMethods
