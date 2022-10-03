const TEST_MODE = false // Change to true to test with local Mailhog

import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import path from 'path'
import nodemailer, { SentMessageInfo } from 'nodemailer'
import marked from 'marked'
import config from '../config.json'
import configTest from '../configTest.json'
import { Attachment } from 'nodemailer/lib/mailer'
import { getFilePath } from '../../../src/components/files/fileHandler'
import { ActionApplicationData } from '../../../src/types'

const isValidEmail = (email: string) => /^[\w\-_+.]+@([\w\-]+\.)+[A-Za-z]{2,}$/gm.test(email)
// Test this regex: https://regex101.com/r/ysGgNx/2

const sendNotification: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { host, port, secure, user, defaultFromName, defaultFromEmail } = config
  const {
    userId = applicationData?.userId,
    email = applicationData?.email,
    to = email,
    cc,
    bcc,
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

  const transporter = nodemailer.createTransport(
    TEST_MODE
      ? configTest
      : {
          host,
          port,
          secure,
          auth: {
            user,
            pass: process.env.SMTP_PASSWORD,
          },
        }
  )

  try {
    const toAddressString = stringifyEmailRecipientsList(to)
    const ccAddressString = stringifyEmailRecipientsList(cc)
    const bccAddressString = stringifyEmailRecipientsList(bcc)

    const hasValidEmails = !(
      toAddressString === '' &&
      ccAddressString === '' &&
      bccAddressString === ''
    )

    if (!hasValidEmails) {
      console.log('Warning: no valid email addresses provided')
    }

    // Create notification database record
    console.log('Creating notification...')
    const notificationResult = await db.createNotification({
      userId,
      applicationId: applicationData?.applicationId,
      reviewId: applicationData?.reviewData?.reviewId,
      emailAddressString: concatEmails(toAddressString, ccAddressString, bccAddressString),
      subject,
      message,
      attachments: Array.isArray(attachments) ? attachments : [attachments],
    })

    // Send email
    if (sendEmail && hasValidEmails) {
      console.log('Sending email...')
      transporter
        .sendMail({
          from: `${fromName} <${fromEmail}>`,
          to: toAddressString,
          cc: ccAddressString,
          bcc: bccAddressString,
          subject,
          text: message,
          html: marked(message),
          attachments: await prepareAttachments(attachments, appRootFolder, filesFolder),
        })
        .then(({ response, envelope, accepted, rejected, pending }: SentMessageInfo) => {
          const serverLogText = `Response: ${response}\nAccepted: ${accepted}\nRejected: ${
            rejected || ''
          }\nPending: ${pending || ''}`
          if (
            response.match(/250 OK*/) &&
            (!rejected || rejected.length === 0) &&
            (!pending || pending.length === 0)
          ) {
            console.log(
              `Email successfully sent to: ${envelope.to}\ncc:${envelope.cc || ''}\nbcc: ${
                envelope.bcc || ''
              }\nSubject: ${subject || ''}\n`
            )
            // Update notification table with email sent confirmation
            db.notificationEmailSent(notificationResult.id, serverLogText)
          } else {
            console.log(
              `Email sending had a problem: ${envelope.to}\ncc:${
                envelope.cc || ''
              }\nServer response: ${response}
              \nCheck "email_server_log" in "notification" table`
            )
            db.notificationEmailError(notificationResult.id, serverLogText)
          }
        })
        .catch((err) => {
          console.log(
            `Email sending FAILED: ${err.message}\nCheck "email_server_log" field in "notification" table`
          )
          db.notificationEmailError(notificationResult.id, `ERROR: ${err.message}`)
        })
    }

    // NOTE: Because sending email happens asynchronously, the output object
    // for this Action does not reflect whether email has sent successfully.
    // The "email_sent" field in the notification table is the only record of this.

    // Accordingly, we should delete the "email_sent" property from the output,
    // as it is misleading (it's always "false")
    delete notificationResult.email_sent

    return {
      status: ActionQueueStatus.Success,
      error_log: !hasValidEmails ? 'WARNING: No valid email addresses' : '',
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
  if (!Array.isArray(emailAddresses)) return isValidEmail(emailAddresses) ? emailAddresses : ''
  return emailAddresses.filter((address) => isValidEmail(address)).join(', ')
}

const concatEmails = (to: string, cc: string, bcc: string): string => {
  let output = to
  if (cc) output += output ? ', ' + cc : cc
  if (bcc) output += output ? ', ' + bcc : bcc
  return output
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
