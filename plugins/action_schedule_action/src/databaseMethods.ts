const databaseMethods = (DBConnect: any) => ({
  createOrUpdateActionSchedule: async ({
    tableName,
    entityId,
    applicationId,
    templateId,
    scheduledTime,
    eventCode,
  }: any) => {
    const text = `
      INSERT into action_schedule ("table", entity_id, event_code, time_scheduled, application_id, template_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (event_code, application_id)
        DO UPDATE SET time_scheduled = $4
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [tableName, entityId, eventCode, scheduledTime, applicationId, templateId],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
