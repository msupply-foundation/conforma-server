import { parseStream } from 'fast-csv'
import { LookupTableService } from '../services'

const ImportCsvUpdateController = async (request: any, reply: any) => {
  const lookupTableId = Number(request.params.lookupTableId)
  const data = await request.file()

  const lookupTableService = LookupTableService({ tableId: lookupTableId })

  await parseStream(data.file, {
    headers: lookupTableService.parseCsvHeaders,
  })
    .on('data', async (row: any) => {
      await lookupTableService.addRow(row)
    })
    .on('end', async (rowCount: any) => {
      await lookupTableService
        .updateTable()
        .catch((error: Error) =>
          reply.status(422).send({ status: 'error', name: error.name, message: error.message })
        )
        .then((message: string[]) => {
          reply.send({ status: 'success', message: JSON.stringify(message) })
        })
    })
    .on('error', (error: any) => {
      reply.status(422).send({ status: 'error', name: error.name, message: error.message })
    })
}

export default ImportCsvUpdateController
