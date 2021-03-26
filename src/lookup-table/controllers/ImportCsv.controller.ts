import { parseStream } from 'fast-csv'
import { toSnakeCase } from '../utils'
import { FieldMapType } from '../types'
import { LookupTableStructureService, LookupTableService } from '../services'

const ImportCsvController = async (request: any, reply: any) => {
  const data = await request.file()
  let fieldMaps: FieldMapType[] = []
  let rows: object[] = []

  const tableNameLabel = data.fields.tableName.value
  const tableName = toSnakeCase(tableNameLabel)
  const lookupTableStructureService = LookupTableStructureService()
  const lookupTableService = LookupTableService()

  try {
    parseStream(data.file, {
      headers: lookupTableStructureService.parseCsvHeaders,
    })
      .on('headers', (_) => {
        fieldMaps = lookupTableStructureService.csvFieldMap
      })
      .on('data', function (row) {
        rows.push(row)
      })
      .on('end', async (rowCount: any) => {
        await lookupTableStructureService.create({
          tableName,
          label: tableNameLabel,
          fieldMap: fieldMaps,
        })
        await lookupTableService.createTable({
          tableName,
          fieldMap: fieldMaps,
        })
        await lookupTableService.createRows({ tableName, rows })

        reply.send({ status: 'success', message: rowCount })
      })
  } catch (error) {
    reply.status(422).send({ status: 'error', message: error.message })
  }
}

export default ImportCsvController
