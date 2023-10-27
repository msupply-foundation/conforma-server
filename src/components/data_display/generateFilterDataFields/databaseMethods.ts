import { camelCase } from 'lodash'
import config from '../../../config'
import { capitaliseFirstLetter, errorMessage } from '../../utilityFunctions'

const FILTER_TEXT_SUFFIX = capitaliseFirstLetter(camelCase(config.filterColumnSuffix))

const databaseMethods = (DBConnect: any) => ({
  getTablesWithFilterColumns: async () => {
    const text = `
      SELECT DISTINCT table_name
        FROM information_schema.columns
        WHERE column_name LIKE '%${config.filterColumnSuffix}'
  `
    try {
      const result = await DBConnect.query({ text, rowMode: 'array' })
      return result.rows.flat()
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getTablesWithFilterColumnDefinitions: async () => {
    const text = `
      SELECT DISTINCT table_name
        FROM data_view_column_definition
         WHERE filter_expression IS NOT NULL
         AND column_name LIKE '%${FILTER_TEXT_SUFFIX}';
        `
    try {
      const result = await DBConnect.query({ text, rowMode: 'array' })
      return result.rows.flat()
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  getTableFilterColumnDefinitions: async ({
    tableNameFullSnake,
    tableNameSnake,
    tableNameFullCamel,
    tableNameCamel,
  }: {
    tableNameFullSnake: string
    tableNameSnake: string
    tableNameFullCamel: string
    tableNameCamel: string
  }) => {
    const text = `
        SELECT column_name AS column,
          filter_expression AS expression,
          filter_data_type AS "dataType"
        FROM data_view_column_definition
          WHERE filter_expression IS NOT NULL
          AND column_name LIKE '%${FILTER_TEXT_SUFFIX}'
          AND (table_name = $1 OR table_name = $2
            OR table_name = $3 OR table_name = $4);
        `
    try {
      const result = await DBConnect.query({
        text,
        values: [tableNameFullSnake, tableNameSnake, tableNameFullCamel, tableNameCamel],
      })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
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
      console.log(errorMessage(err))
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
      console.log(errorMessage(err))
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
      console.log(errorMessage(err))
      throw err
    }
  },
})

export default databaseMethods
