import DBConnect from '../../components/databaseConnect'
import { LookupTableStructurePropType } from '../types'

const createLookupTable = async ({
  tableName,
  fieldMap: fieldMaps,
}: LookupTableStructurePropType) => {
  const text = `CREATE TABLE lookup_table_${tableName}
      (
        ${fieldMaps.map((fieldMap) => `${fieldMap.fieldname} ${fieldMap.dataType}`).join(', ')}
      )`

  try {
    const result = await DBConnect.query({ text })
    console.log('result.rows', result.rows)
    return result.rows
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

export default createLookupTable
