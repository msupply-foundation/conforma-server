import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import path from 'path'
import nodemailer from 'nodemailer'
import marked from 'marked'
import config from '../config.json'
import { Attachment } from 'nodemailer/lib/mailer'
import { getFilePath } from '../../../src/components/files/fileHandler'
import { ActionApplicationData } from '../../../src/types'

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

  const {
    environmentData: { appRootFolder, filesFolder },
  } = applicationData as ActionApplicationData

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
      attachments: Array.isArray(attachments) ? attachments : [attachments],
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
        attachments: await prepareAttachments(attachments, appRootFolder, filesFolder),
      })

      // Update notification table with email sent confirmation
      if (emailResult?.response.match(/250 OK.*/)) {
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
    console.log('Problem sending email:', error.message)
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
Takes an array of file paths in multiple formats and builds them into 
shape expected by sendMail method.
If only one attachment, can be provided without being in an array.
Input elements must be one of:
- <string> uniqueId of file (we will look up the path and filename)
- already formatted sendMail object, with the following properties:
{
  path: <full path/url of file>
  filename: <name to give attached file>
}
- TO-DO: Handle more types of input format (e.g. raw path/url strings)
*/
const prepareAttachments = async (
  attachments: string[] | Attachment[] | string | Attachment,
  appRootFolder: string,
  filesFolder: string
): Promise<Attachment[]> => {
  const attachmentInput = Array.isArray(attachments) ? attachments : [attachments]
  const attachmentObjects = []
  for (const file of attachmentInput) {
    if (typeof file === 'object') {
      if (!file?.path || !file?.filename) throw new Error('Invalid attachment')
      attachmentObjects.push(file)
    } else {
      const { original_filename, file_path } = await getFilePath(file)
      attachmentObjects.push({
        path: path.join(appRootFolder, filesFolder, file_path as string),
        filename: original_filename,
      })
    }
  }
  return attachmentObjects
}
