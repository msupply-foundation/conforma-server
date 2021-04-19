import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

const ImportCsvController = async (request: any, reply: any) => {
  const data = await request.file()
  const tableNameLabel = data.fields.tableName.value
  const lookupTableService = LookupTableService({ tableNameLabel })

  await parseStream(data.file, {
    headers: lookupTableService.parseCsvHeaders,
  })
    .on('data', function (row) {
      lookupTableService.addRow(row)
    })
    .on('end', async (rowCount: any) => {
      await lookupTableService
        .createTable()
        .catch((error: any) =>
          reply.status(422).send({ status: 'error', name: error.name, message: error.message })
        )
        .then((message: string[]) => {
          reply.send({ status: 'success', message: JSON.stringify(message) })
        })
    })
    .on('error', (error) => {
      reply.status(422).send({ status: 'error', name: error.name, message: error.message })
    })
}

export default ImportCsvController
