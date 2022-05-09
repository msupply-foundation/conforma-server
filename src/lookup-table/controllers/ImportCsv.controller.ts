import { FastifyRequest, FastifyReply } from 'fastify'
import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'
import { table } from 'console'

const ImportCsvController = async (request: FastifyRequest, reply: FastifyReply) => {
  const data = await request.files()
  const { tableName } = request.query as any
  const lookupTableService = await LookupTableService({ name: tableName })

  for await (const file of data) {
    await parseStream(file.file, {
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
}

export default ImportCsvController
