const databaseMethods = (DBConnect: any) => {
  getRecordId: async (tableName: string, matchField: string, value: any) => {
    const text = `
      SELECT id FROM "${tableName}"
      WHERE "${matchField}" = $1
    `
    try {
      const result = await DBConnect.query({ text, values: [value] })
      return result?.rows[0]?.id || 0
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }
}
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
