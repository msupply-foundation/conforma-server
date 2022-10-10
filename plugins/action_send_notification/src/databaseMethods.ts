interface NotificationRecord {
  id?: number
  userId?: number | null
  applicationId?: number | null
  reviewId?: number | null
  emailAddressString: string
  subject: string
  message: string
  attachments: string[]
}

const databaseMethods = (DBConnect: any) => ({
  createNotification: async ({
    userId = null,
    applicationId = null,
    reviewId = null,
    emailAddressString = '',
    subject = '',
    message = '',
    attachments = [],
  }: NotificationRecord) => {
    const text = `
      INSERT into notification (user_id, application_id, review_id, email_recipients, subject, message, attachments)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [
          userId,
          applicationId,
          reviewId,
          emailAddressString,
          subject,
          message,
          attachments,
        ],
      })
      return result?.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  notificationEmailSent: async (notificationId: number, serverLog: string) => {
    const text = `
      UPDATE notification SET
        email_sent = true,
        email_server_log = $2
      WHERE id = $1;
    `
    try {
      await DBConnect.query({ text, values: [notificationId, serverLog] })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  notificationEmailError: async (notificationId: number, errorLog: string) => {
    const text = `
      UPDATE notification SET email_server_log = $2
      WHERE id = $1;
    `
    try {
      await DBConnect.query({ text, values: [notificationId, errorLog] })
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
