import databaseMethods from './databaseMethods'
import DBConnect from '../../databaseConnect'
import evaluateExpression from '@openmsupply/expression-evaluator'
import functions from '../../actions/evaluatorFunctions'
import { queryDataTable, updateRecord } from '../gqlDynamicQueries'
import config from '../../../config'
import { getValidTableName } from '../../utilityFunctions'
import fetch from 'node-fetch'
import { camelCase, snakeCase } from 'lodash'
// @ts-ignore
import delay from 'delay-sync'

const graphQLEndpoint = config.graphQLendpoint
const blockSize = 100 // How many database records to process at once

interface Column {
  name: string
  dataType: string
}

interface FilterTextColumnDefinition {
  column: string
  expression: object
  dataType: string
}

export const routeGenerateFilterDataFields = async (request: any, reply: any) => {
  const { table, fullUpdate } = request.query

  // For individual tables, default is NOT full update, but for all tables,
  // default IS full update
  const result = table
    ? await generateFilterDataFields(table, fullUpdate === 'true' ? true : false)
    : await generateAllFilterFilterFields(fullUpdate === 'false' ? false : true)

  return reply.send(result)
}

export const generateAllFilterFilterFields = async (fullUpdate: boolean = true) => {
  const db = databaseMethods(DBConnect)
  const tablesWithColumns: string[] = await db.getTablesWithFilterColumns()
  const tablesWithDefinitions: string[] = await db.getTablesWithFilterColumnDefinitions()

  const tables = Array.from(
    new Set(
      [...tablesWithColumns, ...tablesWithDefinitions].map((table: string) =>
        camelCase(table.replace(config.dataTablePrefix, ''))
      )
    )
  )

  const results = tables.map((table) => generateFilterDataFields(table, fullUpdate))

  return Promise.all(results)
}

export const generateFilterDataFields = async (table: string, fullUpdate: boolean = false) => {
  try {
    const db = databaseMethods(DBConnect)
    const tableNameFull = snakeCase(getValidTableName(table))

    // Get all filter-data-generating columns for table from
    // data_view_column_definitions (must have "filter_expression defined" and
    // have "Filter" as the column name suffix)
    const filterTextColumnDefinitions: FilterTextColumnDefinition[] = (
      await db.getTableFilterColumnDefintions(table)
    ).map(({ column, expression, dataType }: FilterTextColumnDefinition) => ({
      column: snakeCase(column),
      expression,
      dataType: dataType ?? 'character varying',
    }))

    // Get all current columns from whole database with "_filter_data" suffix
    let currentColumns: Column[] = await db.getCurrentFilterColumns(tableNameFull)

    const changedColumns: string[] = []

    // Create or update database columns
    for (const { column, dataType } of filterTextColumnDefinitions) {
      if (!currentColumns.find((col) => column === col.name && dataType === col.dataType)) {
        await db.addOrUpdateColumn(tableNameFull, column, dataType)
        changedColumns.push(column)
      }

      // Remove from current columns list
      currentColumns = currentColumns.filter(({ name }) => name !== column)
    }

    // Delete unused (no filter definitions) columns
    for (const { name } of currentColumns) {
      await db.dropColumn(tableNameFull, name)
    }

    // Iterate over all data table records and update their filter field values
    const allFields = (await DBConnect.getDataTableColumns(tableNameFull)).map(({ name }) =>
      camelCase(name)
    )

    // Pause to allow postgraphile "watch" to detect changed schema
    delay(1000)

    let fetchedCount = 0
    let total = Infinity

    // When not doing a full update, we only want to update *NEW* records, which
    // will be the ones with NULL in all the filter data fields
    const gqlFilter = !fullUpdate
      ? Object.fromEntries(
          filterTextColumnDefinitions.map(({ column }) => [[camelCase(column)], { isNull: true }])
        )
      : {}

    while (fetchedCount < total) {
      const { fetchedRecords, totalCount, error } = await queryDataTable(
        camelCase(tableNameFull),
        allFields,
        gqlFilter,
        blockSize,
        fetchedCount,
        'id',
        true,
        ''
      )

      if (error) return error

      total = totalCount
      fetchedCount += fetchedRecords.length

      for (const record of fetchedRecords) {
        const patch: any = {}
        for (const { column, expression } of filterTextColumnDefinitions) {
          const evaluatedResult = await evaluateExpression(expression, {
            objects: { ...record, functions },
            // pgConnection: DBConnect, probably don't want to allow SQL
            APIfetch: fetch,
            // TO-DO: Need to pass Auth headers to evaluator API calls
            graphQLConnection: { fetch, endpoint: graphQLEndpoint },
          })
          // console.log('evaluatedResult', evaluatedResult)
          patch[camelCase(column)] = evaluatedResult
        }
        const result = await updateRecord(camelCase(tableNameFull), record.id, patch, '')

        if (result?.error) return result.error
      }
    }

    return {
      success: true,
      table: tableNameFull,
      updatedDatabaseColumns: changedColumns,
      unchangedDatabaseColumns: filterTextColumnDefinitions
        .map(({ column }) => column)
        .filter((column) => !changedColumns.includes(column)),
      recordsProcessed: fetchedCount,
    }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
