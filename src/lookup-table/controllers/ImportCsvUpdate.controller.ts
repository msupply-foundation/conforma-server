import { parseStream } from 'fast-csv'
import { LookupTableStructureService } from '../services'

const ImportCsvUpdateController = async (request: any, reply: any) => {
  const lookupTableId = Number(request.params.lookupTableId)
  const data = await request.file()

  const lookupTableStructure = LookupTableStructureService()
  let fieldMaps = []

  try {
    const LookupTableStructure = await lookupTableStructure.getById(lookupTableId)

    await parseStream(data.file, {
      headers: lookupTableStructure.parseCsvHeaders,
    }).on('headers', (_) => {
      fieldMaps = lookupTableStructure.csvFieldMap
    })

    reply.send({ status: 'success', message: LookupTableStructure })
  } catch (error) {
    reply.send(error)
  }
}

export default ImportCsvUpdateController
