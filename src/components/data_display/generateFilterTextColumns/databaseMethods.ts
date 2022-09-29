import { camelCase } from 'lodash'
import config from '../../../config'
import { capitaliseFirstLetter } from '../../utilityFunctions'

const FILTER_TEXT_SUFFIX = capitaliseFirstLetter(camelCase(config.filterColumnSuffix))

const databaseMethods = (DBConnect: any) => ({
  getFilterColumnDefintions: async (tableName: string) => {
    const text = `
        SELECT column_name AS column,
          filter_expression AS expression,
          filter_data_type AS "dataType"
        FROM data_view_column_definition
          WHERE filter_expression IS NOT NULL
          AND column_name LIKE '%${FILTER_TEXT_SUFFIX}'
          AND table_name = $1;
        `
    try {
      const result = await DBConnect.query({
        text,
        values: [tableName],
      })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getCurrentFilterColumns: async (tableName: string) => {
    const text = `
    SELECT column_name as name,
      data_type as "dataType"
      FROM information_schema.columns
      WHERE table_name = $1
      AND column_name LIKE '%${config.filterColumnSuffix}'
  `
    try {
      const result = await DBConnect.query({ text, values: [tableName] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  addOrUpdateColumn: async (table: string, columnName: string, dataType: string) => {
    const text = `
      ALTER TABLE "${table}"
        DROP COLUMN IF EXISTS ${columnName},
        ADD COLUMN ${columnName} ${dataType};
    `
    try {
      await DBConnect.query({ text })
      return
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  dropColumn: async (table: string, columnName: string) => {
    const text = `
      ALTER TABLE "${table}"
        DROP COLUMN IF EXISTS ${columnName};
    `
    try {
      await DBConnect.query({ text })
      return
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
