import { errorMessage } from '../../../src/components/utilityFunctions'

const databaseMethods = (DBConnect: any) => ({
  createVerification: async ({
    uniqueId,
    applicationId,
    expiryTime,
    eventCode,
    message,
    data,
  }: any) => {
    const text = `
      INSERT into verification (unique_id, application_id, time_expired, event_code, message, data)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [uniqueId, applicationId, expiryTime, eventCode, message, data],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
