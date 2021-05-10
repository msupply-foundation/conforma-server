const databaseMethods = (DBConnect: any) => ({
  updateEntity: async (tableName: string, entity: { [key: string]: any }) => {
    const text = `
      UPDATE "${tableName}" SET (${Object.keys(entity)})
      = (${DBConnect.getValuesPlaceholders(entity)})
      WHERE id = ${entity.id}
      RETURNING *
      `
    try {
      const result = await DBConnect.query({ text, values: Object.values(entity) })
      return { success: true, [tableName]: result.rows[0] }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  createEntity: async (tableName: string, entity: { [key: string]: any }) => {
    const text = `
      INSERT INTO "${tableName}" (${Object.keys(entity)}) 
      VALUES (${DBConnect.getValuesPlaceholders(entity)})
      RETURNING *
      `
    try {
      const result = await DBConnect.query({ text, values: Object.values(entity) })
      return { success: true, [tableName]: result.rows[0] }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
