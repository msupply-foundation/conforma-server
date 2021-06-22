import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods, { DatabaseMethodsType } from './databaseMethods'
import { DBConnectType } from '../../../src/components/databaseConnect'
import nodemailer from 'nodemailer'
import marked from 'marked'
import config from '../config.json'
import { Attachment } from 'nodemailer/lib/mailer'

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
    if (sendEmail) {
      console.log('Sending email...')
      // Note: Using "any" type as imported @types defintions is incorrect, doesn't recognise some fields on "SentMessageInfo" type
      const emailResult: any = await transporter.sendMail({
        from: `${fromName} <${fromEmail}>`,
        to: emailAddressString,
        subject,
        text: message,
        html: marked(message),
        attachments: prepareAttachments(attachments),
      })

      // Update notification table with email sent confirmation
      if (emailResult?.response.match(/250 OK.*/)) {
        console.log('Result', emailResult)
        console.log(`Email successfully sent to: ${emailResult.envelope.to}\n`)
        notificationResult = await db.notificationEmailSent(notificationResult.id)
      }
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

/*
Takes an array of file paths in a range of formats and builds them into 
shape expected by sendMail method.
Input must be one of:
- <string> full url (starting with http) of file
- <string> relative url of file (starts with '/') -- gets appended with Host
- <string> uniqueId of file
- already formatted sendMail object, with the following properties:
{
  path: <full url of file>
  filename: <name to give attached file>
}
*/
const prepareAttachments = (attachments: string[]): Attachment[] =>
  attachments.map((file: any) => {
    if (typeof file === 'object') {
      if 
    }
  })
