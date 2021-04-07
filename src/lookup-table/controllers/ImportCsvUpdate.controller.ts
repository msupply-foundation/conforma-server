import { parseStream } from 'fast-csv'
import { LookupTableService, LookupTableStructureService } from '../services'

const ImportCsvUpdateController = async (request: any, reply: any) => {
  const lookupTableId = Number(request.params.lookupTableId)
  const data = await request.file()
  let lookupTableDbStructure: any = {}

  const lookupTableStructure = LookupTableStructureService()
  const lookupTableService = LookupTableService()

  try {
    lookupTableDbStructure = await lookupTableStructure.getById(lookupTableId)

    let stream = await parseStream(data.file, {
      headers: lookupTableStructure.parseCsvHeaders,
    })
      .on('headers', (_) => {
        lookupTableStructure.compareFieldMaps(
          lookupTableDbStructure.fieldMap,
          lookupTableStructure.csvFieldMap
        )
      })
      .on('data', async (row: any) => {
        stream.pause()
        // TODO: Row ID validation, if row has id and that does not exist in database
        await lookupTableStructure.addToCsvRows(row, lookupTableDbStructure)
        stream.resume()
      })
      .on('end', async (rowCount: any) => {
        await lookupTableStructure.createNewColumns(lookupTableDbStructure)
        await lookupTableService.createUpdateRows(
          lookupTableDbStructure.name,
          lookupTableStructure.finalRows
        )
      })
      .on('error', (error: any) => {
        reply.send(error)
      })
  } catch (error) {
    reply.send(error)
  }

  reply.send({ status: 'success', message: 'Lookup table successfully updated' })
}

export default ImportCsvUpdateController
