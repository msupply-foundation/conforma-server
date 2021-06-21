import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods, { DatabaseMethodsType } from './databaseMethods'
import { DBConnectType } from '../../../src/components/databaseConnect'
import nodemailer from 'nodemailer'
// import marked from 'marked'
import config from '../config.json'

const sendNotification: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { host, port, secure, user, defaultFromName, defaultFromEmail } = config
  const {
    userId = applicationData?.userId,
    email = applicationData?.email,
    fromName = defaultFromName,
    fromEmail = defaultFromEmail,
    subject,
    message,
    attachments = [],
    sendEmail = true,
  } = parameters

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  try {
    const emailAddressString = stringifyEmailRecipientsList(email)

    // Create notification database record
    console.log('Creating notification...')
    let notificationResult
    notificationResult = await db.createNotification({
      userId,
      applicationId: applicationData?.applicationId,
      emailAddressString,
      subject,
      message,
      attachments,
    })

    // Send email
    // Note: Using "any" type as imported @types defintions is incorrect, doesn't recognise some fields on "emailResult"
    console.log('Sending email...')
    const emailResult: any = await transporter.sendMail({
      from: `${fromName} <${fromEmail}>`,
      to: emailAddressString,
      subject,
      text: message,
      // html: Parse text as Markdown TO-DO
    })

    // Update notification table with email sent confirmation
    if (emailResult?.response.match(/250 OK.*/)) {
      console.log(`Email successfully sent to: ${emailResult.envelope.to}\n`)
      notificationResult = await db.notificationEmailSent(notificationResult.id)
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { notification: notificationResult },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default sendNotification

const stringifyEmailRecipientsList = (emailAddresses: string | string[]): string => {
  if (!Array.isArray(emailAddresses)) return emailAddresses
  return emailAddresses.join(', ')
}
