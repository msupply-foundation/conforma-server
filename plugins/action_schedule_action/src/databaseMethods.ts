import { get } from 'lodash'
import { errorMessage } from '../../../src/components/utilityFunctions'

const databaseMethods = (DBConnect: any) => ({
  getScheduledTrigger: async ({ applicationId, eventCode }: any): Promise<Date | null> => {
    const text = `
      SELECT time_scheduled FROM trigger_schedule
      WHERE application_id = $1
      AND event_code = $2
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [applicationId, eventCode],
      })
      return result?.rows[0]?.time_scheduled || null
    } catch (err) {
      return null
    }
  },
  createOrUpdateTriggerSchedule: async ({
    applicationId,
    templateId,
    scheduledDateTime,
    eventCode,
    data,
    active,
  }: any) => {
    const text = `
      INSERT into trigger_schedule (event_code, time_scheduled, application_id, template_id, data, is_active, editor_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, NULL)
      ON CONFLICT (event_code, application_id)
        DO UPDATE SET time_scheduled = $2, is_active = $6
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [eventCode, scheduledDateTime, applicationId, templateId, data, active],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(errorMessage(err))
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
      console.log(errorMessage(err))
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
