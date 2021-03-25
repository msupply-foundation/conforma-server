import DBConnect from '../../components/databaseConnect'
import { LookupTableStructurePropType } from '../types'

const addStructureToDb = async ({ tableName, label, fieldMap }: LookupTableStructurePropType) => {
  const text = `INSERT INTO lookup_table (name,label,field_map) VALUES ($1,$2,$3) RETURNING id`

  try {
    const result = await DBConnect.query({
      text,
      values: [tableName, label, JSON.stringify(fieldMap)],
    })
    return result.rows.map((row: any) => row.id)
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

export default addStructureToDb
