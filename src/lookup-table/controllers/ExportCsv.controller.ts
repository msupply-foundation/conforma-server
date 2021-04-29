import { writeToBuffer } from 'fast-csv'
import { LookupTableService } from '../services'

const ExportCsv = async (request: any, reply: any) => {
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
