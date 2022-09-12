const databaseMethods = (DBConnect: any) => ({
  createOrUpdateTriggerSchedule: async ({
    applicationId,
    templateId,
    scheduledTime,
    eventCode,
    data,
  }: any) => {
    const text = `
      INSERT into trigger_schedule (event_code, time_scheduled, application_id, template_id, data, editor_user_id)
      VALUES ($1, $2, $3, $4, $5, NULL)
      ON CONFLICT (event_code, application_id)
        DO UPDATE SET time_scheduled = $2, is_active = TRUE
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [eventCode, scheduledTime, applicationId, templateId, data],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  cancelTriggerSchedule: async ({ applicationId, eventCode }: any) => {
    const text = `
      UPDATE trigger_schedule SET is_active = false
      WHERE application_id = $1
      AND event_code = $2
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [applicationId, eventCode],
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
