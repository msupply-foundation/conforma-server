import { FastifyRequest, FastifyReply } from 'fastify'
import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'
import { ILookupTableCsvRequest } from '../types'

const ImportCsvUpdateController = async (
  request: FastifyRequest<ILookupTableCsvRequest>,
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
      try {
        const result = await lookupTableService.updateTable()
        reply.send({ status: 'success', message: JSON.stringify(result) })
      } catch (error) {
        reply.status(422).send({ status: 'error', name: error.name, message: error.message })
      }
    })
    .on('error', (error: Error) => {
      reply.status(422).send({ status: 'error', name: error.name, message: error.message })
    })
}

export default ImportCsvUpdateController
