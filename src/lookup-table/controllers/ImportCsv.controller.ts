import { FastifyRequest, FastifyReply } from 'fastify'
import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

const ImportCsvController = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await request.file()
  const tableNameLabel: string = (data.fields.tableName as any).value
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
        .catch((error: Error) =>
          reply.status(422).send({ status: 'error', name: error.name, message: error.message })
        )
        .then((message) => {
          reply.send({ status: 'success', message: JSON.stringify(message) })
        })
    })
    .on('error', (error) => {
      reply.status(422).send({ status: 'error', name: error.name, message: error.message })
    })
}

export default ImportCsvController
