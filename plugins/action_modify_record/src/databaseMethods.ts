const databaseMethods = (DBConnect: any) => ({
  doesRecordExist: async (tableName: string, matchField: string, value: any) => {
    const text = `
      SELECT COUNT(*) FROM "${tableName}"
      WHERE "${matchField}" = $1
    `
    try {
      const result = await DBConnect.query({ text, values: [value] })
      return result.rows[0].count > 0
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  updateRecord: async (
    tableName: string,
    matchField: string,
    matchValue: any,
    record: { [key: string]: any }
  ) => {
    const placeholders = DBConnect.getValuesPlaceholders(record)
    const matchValuePlaceholder = `$${placeholders.length + 1}`
    const text = `
      UPDATE "${tableName}" SET (${Object.keys(record)})
      = (${DBConnect.getValuesPlaceholders(record)})
      WHERE "${matchField}" = ${matchValuePlaceholder}
      RETURNING *
      `
    try {
      const result = await DBConnect.query({
        text,
        values: [...Object.values(record), matchValue],
      })
      return { success: true, [tableName]: result.rows[0] }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  createRecord: async (tableName: string, record: { [key: string]: any }) => {
    const text = `
      INSERT INTO "${tableName}" (${Object.keys(record)}) 
      VALUES (${DBConnect.getValuesPlaceholders(record)})
      RETURNING *
      `
    try {
      const result = await DBConnect.query({ text, values: Object.values(record) })
      return { success: true, [tableName]: result.rows[0] }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
