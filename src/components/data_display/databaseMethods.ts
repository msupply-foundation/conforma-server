const databaseMethods = (DBConnect: any) => ({
  updateRecord: async (tableName: string, id: string, record: { [key: string]: any }) => {
    const placeholders = DBConnect.getValuesPlaceholders(record)
    const matchValuePlaceholder = `$${placeholders.length + 1}`

    const text = `
        UPDATE "${tableName}" SET ${getKeys(record, true)}
        = (${placeholders})
        WHERE id = ${matchValuePlaceholder}
        RETURNING *
        `
    try {
      const result = await DBConnect.query({
        text,
        values: [...Object.values(record), id],
      })
      return { success: true, [tableName]: result.rows[0] }
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
