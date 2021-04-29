import { writeToBuffer } from 'fast-csv'
import { FastifyRequest, FastifyReply } from 'fastify'
import { LookupTableService } from '../services'
import { ILookupTableCsvRequest } from '../types'

const ExportCsv = async (request: FastifyRequest<ILookupTableCsvRequest>, reply: FastifyReply) => {
  const tableId = Number(request.params.lookupTableId)

  const lookupTableService = await LookupTableService({ tableId })
  try {
    const tableData = await lookupTableService.getAllRowsForTable()

    var csvStream = await writeToBuffer(tableData, {
      headers: true,
    })

    reply
      .header('Content-disposition', 'attachment; filename=myFile.csv')
      .header('content-type', 'text/csv')
      .send(csvStream)
  } catch (error) {
    reply.status(422).send({ status: 'error', name: error.name, message: error.message })
  }
}

export default ExportCsv
