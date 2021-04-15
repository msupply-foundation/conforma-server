import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

const ImportCsvUpdateController = async (request: any, reply: any) => {
  const lookupTableId = Number(request.params.lookupTableId)
  const data = await request.file()

  const lookupTableService = LookupTableService({ tableId: lookupTableId })

  let stream = await parseStream(data.file, {
    headers: lookupTableService.parseCsvHeaders,
  })
    .on('data', async (row: any) => {
      stream.pause()
      await lookupTableService.addRow(row)
      stream.resume()
    })
    .on('end', async (rowCount: any) => {
      await lookupTableService.updateTable()
      reply.send({ status: 'success', message: 'Lookup table successfully updated' })
    })
    .on('error', (error: any) => {
      reply.status(422).send({ status: 'error', name: error.name, message: error.message })
    })
}

export default ImportCsvUpdateController
