const databaseMethods = (DBConnect: any) => ({
  doesCounterExist: async (counterName: string) => {
    const text = `
        SELECT COUNT(*) FROM counter
        WHERE name = $1
      `
    try {
      const result = await DBConnect.query({
        text,
        values: [counterName],
      })
      return Number(result?.rows[0].count) === 1
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  createCounter: async (name: string, counterInit = 1) => {
    const text = `
        INSERT INTO counter (name, value) VALUES ($1, $2);
      `
    try {
      await DBConnect.query({ text, values: [name, counterInit] })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
