const databaseMethods = (DBConnect: any) => ({
  createActionSchedule: async ({
    tableName,
    entityId,
    applicationId,
    templateId,
    scheduledTime,
    code,
  }: any) => {
    const text = `
      INSERT into action_schedule ("table", entity_id, template_action_code, time_scheduled, application_id, template_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [tableName, entityId, code, scheduledTime, applicationId, templateId],
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
