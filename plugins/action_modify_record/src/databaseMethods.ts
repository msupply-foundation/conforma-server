const databaseMethods = (DBConnect: any) => ({
  updateEntity: async (tableName: string, record: { [key: string]: any }) => {
    const text = `
      UPDATE "${tableName}" SET (${Object.keys(record)})
      = (${DBConnect.getValuesPlaceholders(record)})
      WHERE id = ${record.id}
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
  createEntity: async (tableName: string, record: { [key: string]: any }) => {
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
