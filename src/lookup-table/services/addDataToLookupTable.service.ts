import DBConnect from '../../components/databaseConnect'

const addDataToLookupTable = async ({ tableName, rows }: { tableName: string; rows: any }) => {
  return await rows.map(async (row: any) => {
    delete row.id

    addIntoLookupTable({ tableName, row })
  })
}

const addIntoLookupTable = async ({ tableName, row }: { tableName: string; row: object }) => {
  const text = `INSERT INTO lookup_table_${tableName}(${Object.keys(row)}) VALUES (
          ${Object.keys(row)
            .map((key, index) => {
              return '$' + String(index + 1)
            })
            .join(', ')}) RETURNING id`

  try {
    const result = await DBConnect.query({ text, values: [...Object.values(row)] })
    console.log(result.rows.map((row: any) => row.id))
    return result.rows.map((row: any) => row.id)
  } catch (err) {
    console.log(err.message)
    throw err
  }
}

export { addDataToLookupTable, addIntoLookupTable }
