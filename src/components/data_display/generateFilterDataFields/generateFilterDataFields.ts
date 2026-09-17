import databaseMethods from './databaseMethods'
import DBConnect from '../../database/databaseConnect'
import FigTree from '../../fig-tree-evaluator/FigTree'
import { queryDataTable, updateRecord } from '../gqlDynamicQueries'
import config from '../../../config'
import { errorMessage, getValidTableName } from '../../utilityFunctions'
import { camelCase, snakeCase } from 'lodash'
import { setTimeout as sleep } from 'node:timers/promises'

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
    const tableNameNoPrefix = table.replace('dataTable', '').replace('data_table_', '')
    const tableNameFullSnake = getValidTableName(table)
    const tableNameSnake = snakeCase(tableNameNoPrefix)
    const tableNameFullCamel = camelCase(tableNameFullSnake)
    const tableNameCamel = camelCase(tableNameNoPrefix)

    // Get all filter-data-generating columns for table from
    // data_view_column_definitions (must have "filter_expression defined" and
    // have "FilterData" as the column name suffix)
    const filterTextColumnDefinitions: FilterTextColumnDefinition[] = (
      await db.getTableFilterColumnDefinitions({
        tableNameFullSnake,
        tableNameSnake,
        tableNameFullCamel,
        tableNameCamel,
      })
    ).map(({ column, expression, dataType }: FilterTextColumnDefinition) => ({
      column: snakeCase(column),
      expression,
      dataType: dataType ?? 'character varying',
    }))

    // Get all current columns from whole database with "_filter_data" suffix
    let currentColumns: Column[] = await db.getCurrentFilterColumns(tableNameFullSnake)

    const changedColumns: string[] = []

    // Create or update database columns
    for (const { column, dataType } of filterTextColumnDefinitions) {
      if (!currentColumns.find((col) => column === col.name && dataType === col.dataType)) {
        await db.addOrUpdateColumn(tableNameFullSnake, column, dataType)
        changedColumns.push(column)
      }

      // Remove from current columns list
      currentColumns = currentColumns.filter(({ name }) => name !== column)
    }

    // Delete unused (no filter definitions) columns
    for (const { name } of currentColumns) {
      await db.dropColumn(tableNameFullSnake, name)
    }

    // If there are no filter columns to populate, we're done. Any stale columns
    // have been dropped above, so there's nothing left to do -- bail out before
    // the sleep + full-table scan below, which would otherwise run an empty
    // update against every record in the table.
    if (filterTextColumnDefinitions.length === 0)
      return {
        success: true,
        table: tableNameFullSnake,
        updatedDatabaseColumns: changedColumns,
        unchangedDatabaseColumns: [],
        recordsProcessed: 0,
      }

    // Iterate over all data table records and update their filter field values
    const allFields = (await DBConnect.getDataTableColumns(tableNameFullSnake)).map(({ name }) =>
      camelCase(name)
    )

    // Pause to allow postgraphile "watch" to detect changed schema
    await sleep(1000)

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
        camelCase(tableNameFullSnake),
        allFields,
        gqlFilter,
        blockSize,
        fetchedCount,
        'id',
        true
      )

      if (error) return error

      total = totalCount
      fetchedCount += fetchedRecords.length

      for (const record of fetchedRecords) {
        const patch: any = {}
        for (const { column, expression } of filterTextColumnDefinitions) {
          try {
            const evaluatedResult = await FigTree.evaluate(expression, { data: { ...record } })
            patch[camelCase(column)] = evaluatedResult === '' ? null : evaluatedResult
          } catch {
            // If evaluation fails, just continue with next record
          }
        }
        // Skip records where nothing evaluated -- an empty patch would be
        // rejected by the update mutation and abort the whole run
        if (Object.keys(patch).length === 0) continue

        const result = await updateRecord(camelCase(tableNameFullSnake), record.id, patch, '')

        if (result?.error) return result.error
      }
    }

    return {
      success: true,
      table: tableNameFullSnake,
      updatedDatabaseColumns: changedColumns,
      unchangedDatabaseColumns: filterTextColumnDefinitions
        .map(({ column }) => column)
        .filter((column) => !changedColumns.includes(column)),
      recordsProcessed: fetchedCount,
    }
  } catch (err) {
    return { success: false, error: errorMessage(err) }
  }
}
