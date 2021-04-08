import { writeToBuffer } from 'fast-csv'
import { LookupTableService, LookupTableStructureService } from '../services'

const ExportCsv = async (request: any, reply: any) => {
  const lookupTableId = Number(request.params.lookupTableId)

  const lookupTableStructure = LookupTableStructureService()
  const lookupTableService = LookupTableService()

  const lookupTableDbStructure = await lookupTableStructure.getById(lookupTableId)
  const tableData = await lookupTableService.getAll({ tableName: lookupTableDbStructure.name })

  var csvStream = await writeToBuffer(tableData, {
    headers: true,
    transform: (row: any) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          lookupTableDbStructure.fieldMap.find((fieldMap: any) => fieldMap.fieldname === key).label,
          value,
        ])
      ),
  })

  reply
    .header('Content-disposition', 'attachment; filename=myFile.csv')
    .header('content-type', 'text/csv')
    .send(csvStream)
}

export default ExportCsv
