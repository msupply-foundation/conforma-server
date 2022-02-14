import DBConnect from '../../src/components/databaseConnect'

const databaseMethods = () => ({
  getDatabaseVersion: async () => {
    const text = `SELECT id FROM "user" WHERE username = $1`
    try {
      const result = await DBConnect.query({ text, values: [username] })
      return result.rows[0]?.id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
