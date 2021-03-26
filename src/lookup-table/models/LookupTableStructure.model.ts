import DBConnect from '../../components/databaseConnect'
import { LookupTableStructurePropType } from '../types'

const LookupTableStructureModel = () => {
  const getByID = async (lookupTableId: number) => {
    const data = await DBConnect.gqlQuery(
      `
      query getLookupTableStructure($id: Int!) {
        lookupTable(id: $id) {
          label
          name
          fieldMap
        }
      }
      `,
      { id: lookupTableId }
    )

    return data.lookupTable
  }

  const create = async ({ tableName, label, fieldMap }: LookupTableStructurePropType) => {
    const text = `INSERT INTO lookup_table (name,label,field_map) VALUES ($1,$2,$3) RETURNING id`

    const result = await DBConnect.query({
      text,
      values: [tableName, label, JSON.stringify(fieldMap)],
    })
    return result.rows.map((row: any) => row.id)
  }
  return {
    getByID,
    create,
  }
}

export default LookupTableStructureModel
