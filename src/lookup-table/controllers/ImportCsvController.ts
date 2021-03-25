import { parseStream } from 'fast-csv'
import { toSnakeCase } from '../utils'
import { FieldMapType } from '../types'
import {
  addStructureToDb,
  createLookupTable,
  addDataToLookupTable,
  parseCsvHeaders,
} from '../services'

const ImportCsvController = async (request: any, reply: any) => {
  const data = await request.file()
  let fieldMaps: FieldMapType[] = []
  let rows: object[] = []

  const tableNameLabel = data.fields.tableName.value
  const tableName = toSnakeCase(tableNameLabel)
  const parseHeaders = parseCsvHeaders()

  try {
    parseStream(data.file, {
      headers: parseHeaders.parse,
    })
      .on('headers', (_) => {
        fieldMaps = parseHeaders.fieldMap
      })
      .on('data', function (row) {
        rows.push(row)
      })
      .on('end', async (rowCount: any) => {
        await addStructureToDb({
          tableName,
          label: tableNameLabel,
          fieldMap: fieldMaps,
        })
        await createLookupTable({
          tableName,
          fieldMap: fieldMaps,
        })
        await addDataToLookupTable({ tableName, rows })

        reply.send({ status: 'success', message: rowCount })
      })
  } catch (error) {
    reply.status(422).send({ status: 'error', message: error.message })
  }
}

export default ImportCsvController
