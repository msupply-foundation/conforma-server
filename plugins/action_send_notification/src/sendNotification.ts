const USE_MAIL_HOG = false // Change to true to test with local Mailhog

import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import path from 'path'
import nodemailer, { SentMessageInfo } from 'nodemailer'
import marked from 'marked'
import configTest from '../configTest.json'
import { Attachment } from 'nodemailer/lib/mailer'
import { getFilePath } from '../../../src/components/files/fileHandler'
import { ActionApplicationData } from '../../../src/types'
import config from '../../../src/config'

type OperationMode = 'NORMAL' | 'TEST_EMAIL' | 'NO_EMAIL' | 'MAILHOG'
/*
Operation modes:

- NORMAL: Emails are sent normally according to action configurations
- TEST_EMAIL: All emails are sent to a single address, defined in server
  preferences "testingEmail" property. Used on testing servers or in
  development.
- NO_EMAIL: No emails are sent at all. Used for automated testing, or when a
  "testingEmail" address is not provided.
- MAIL_HOG: All emails are relayed through a local MailHog SMTP server (so not
  actually sent). An alternative development mode.
*/

const isValidEmail = (email: string) => /^[\w\-_+.]+@([\w\-]+\.)+[A-Za-z]{2,}$/gm.test(email)
// Test this regex: https://regex101.com/r/ysGgNx/2

const sendNotification: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)

  const {
    environmentData: { appRootFolder, filesFolder, SMTPConfig, webHostUrl, productionHost },
    other,
  } = applicationData as ActionApplicationData

  const testingEmail = config.testingEmail

  const mode = getOperationMode({
    mailHog: USE_MAIL_HOG,
    webHostUrl,
    productionHost,
    suppressEmail: other?.suppressEmail ?? false,
    testingEmail,
  })

  // Used to disable email sending when testing -- turned on by trigger testing
  // tool by default
  const suppressEmail = other?.suppressEmail ?? false

  const {
    userId,
    email,
    to = email,
    cc,
    bcc,
    fromName = SMTPConfig?.defaultFromName,
    fromEmail = SMTPConfig?.defaultFromEmail,
    subject,
    message,
    attachments = [],
    sendEmail = true,
  } = parameters

  const transporter = SMTPConfig
    ? nodemailer.createTransport(
        mode === 'MAILHOG'
          ? configTest
          : {
              host: SMTPConfig.host,
              port: SMTPConfig.port,
              secure: SMTPConfig.secure,
              auth: {
                user: SMTPConfig.user,
                pass: process.env.SMTP_PASSWORD,
              },
            }
      )
    : null

  try {
    const toAddressString = stringifyEmailRecipientsList(to)
    const ccAddressString = stringifyEmailRecipientsList(cc)
    const bccAddressString = stringifyEmailRecipientsList(bcc)

    const hasValidEmails = !(
      toAddressString === '' &&
      ccAddressString === '' &&
      bccAddressString === ''
    )

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
    console.log(`Email mode: ${mode}`)
    console.log(`Action sendEmail setting: ${sendEmail}`)
    if (mode !== 'NO_EMAIL' && sendEmail && hasValidEmails && transporter) {
      console.log(
        `Sending email to: ${toAddressString}\ncc:${ccAddressString}\nbcc: ${bccAddressString}\nSubject: ${
          subject || ''
        }\n`
      )
      transporter
        .sendMail({
          from: `${fromName} <${fromEmail}>`,
          to: mode === 'TEST_EMAIL' ? '' : toAddressString,
          cc: mode === 'TEST_EMAIL' ? '' : ccAddressString,
          bcc: mode === 'TEST_EMAIL' ? testingEmail : bccAddressString,
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
            console.log(`Email successfully sent to: ${envelope.to}\n`)
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
    //warnings and errors if send email isn't working
    if (!transporter) {
      console.log('Email not sent - missing email configuration')
      db.notificationEmailError(notificationResult.id, `WARNING: Email configuration not provided`)
    } else if (!hasValidEmails) {
      console.log('Email not sent - no valid email address')
      db.notificationEmailError(notificationResult.id, `WARNING: No valid email addresses`)
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
  const attachmentObjects: Attachment[] = []
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

const isLiveServer = (webHostUrl: string, productionHost?: string | null) => {
  if (!productionHost) return true

  const re = new RegExp(`^https?:\/\/${productionHost}.*`)
  return re.test(webHostUrl)
}

interface OpModeParameters {
  webHostUrl: string
  productionHost: string | null
  mailHog: boolean
  suppressEmail: boolean
  testingEmail?: string
}

const getOperationMode = ({
  webHostUrl,
  productionHost,
  mailHog,
  suppressEmail,
  testingEmail,
}: OpModeParameters): OperationMode => {
  switch (true) {
    case suppressEmail:
      return 'NO_EMAIL'
    case mailHog:
      return 'MAILHOG'
    case isLiveServer(webHostUrl, productionHost):
      return 'NORMAL'
    case !!testingEmail:
      return 'TEST_EMAIL'
    default:
      return 'NO_EMAIL'
  }
}
