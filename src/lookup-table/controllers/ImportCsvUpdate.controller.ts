import { FastifyRequest, FastifyReply, RequestGenericInterface } from 'fastify'
import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

interface IImportCsvUpdateRequest extends RequestGenericInterface {
  Params: { lookupTableId: string }
}

const ImportCsvUpdateController = async (
  request: FastifyRequest<IImportCsvUpdateRequest>,
  reply: FastifyReply
) => {
  const { lookupTableId } = request.params
  const data = await request.file()

  const lookupTableService = await LookupTableService({ tableId: Number(lookupTableId) })

  await parseStream(data.file, {
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

export default ImportCsvUpdateController
