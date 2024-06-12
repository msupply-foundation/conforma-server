import { FastifyRequest, FastifyReply, RequestGenericInterface } from 'fastify'
import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

interface ImportCsvUpdateRequest {
  Params: { lookupTableId: string }
  Querystring: { code: string }
}

const ImportCsvUpdateController = async (
  request: FastifyRequest<ImportCsvUpdateRequest>,
  reply: FastifyReply
) => {
  const { lookupTableId } = request.params
  const { code } = request.query
  const data = await request.files()

  const lookupTableService = await LookupTableService({
    tableId: Number(lookupTableId),
    dataViewCode: code,
  })

  for await (const file of data) {
    await parseStream(file.file, {
      headers: lookupTableService.parseCsvHeaders,
    })
      .on('data', async (row) => {
        await lookupTableService.addRow(row)
      })
      .on('end', async (rowCount: number) => {
        await lookupTableService
          .updateTable()
          .catch((error: Error) =>
            reply.status(422).send({ status: 'error', name: error.name, message: error.message })
          )
          .then((message) => {
            reply.send({ status: 'success', message: JSON.stringify(message) })
          })
      })
      .on('error', (error: Error) => {
        reply.status(422).send({ status: 'error', name: error.name, message: error.message })
      })
  }
}

export default ImportCsvUpdateController
