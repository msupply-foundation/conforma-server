interface NotificationRecord {
  id?: number
  userId?: number
  applicationId?: number
  // emailAddresses: string[]
  // application_id integer REFERENCES public.application (id),
  // email_recipients varchar[],
  // subject varchar,
  // message varchar,
  // attachments varchar[],
  // email_sent boolean DEFAULT FALSE,
  // is_read boolean DEFAULT FALSE
}

const databaseMethods = (DBConnect: any) => ({
  createNotification: async ({
    userId = null,
    applicationId = null,
    emailAddressString = null,
    subject = '',
    message = '',
    attachments = [],
  }: any) => {
    const text = `
      INSERT into notification (user_id, application_id, email_recipients, subject, message, attachments)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [userId, applicationId, emailAddressString, subject, message, attachments],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  notificationEmailSent: async (notificationId: number) => {
    const text = `
      UPDATE notification SET email_sent = true
      WHERE id = $1
      RETURNING *
    `
    try {
      const result = await DBConnect.query({ text, values: [notificationId] })
      return result?.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
