import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods, { DatabaseMethodsType } from './databaseMethods'
import { DBConnectType } from '../../../src/components/databaseConnect'
import nodemailer from 'nodemailer'
// import marked from 'marked'
import config from '../config.json'

const sendNotification: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const { host, port, secure, user } = config
  const {
    emailAddresses,
    from = user,
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

  console.log('Sending email...')

  try {
    // Create notification database record

    // Send email
    const result = await transporter.sendMail({
      from,
      to: 'ceejaysmith@gmail.com',
      subject,
      text: 'This is my email',
    })

    console.log('Message sent:', result)
    // await createOrUpdateTable(DBConnect, db, tableName, record)
    // let recordId = await db.getRecordId(tableName, fieldToMatch, valueToMatch)
    // const isUpdate = recordId !== 0
    // let result: any = {}
    // if (isUpdate) {
    //   // UPDATE
    //   console.log(`Updating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
    //   result = await db.updateRecord(tableName, recordId, record)
    // } else {
    //   // CREATE NEW
    //   console.log(`Creating ${tableName} record: ${JSON.stringify(record, null, 2)}`)
    //   result = await db.createRecord(tableName, record)
    //   recordId = result.recordId
    // }
    // await db.createJoinTableAndRecord(tableName, applicationId, recordId)
    // if (!result.success) throw new Error('Problem creating or updating record')
    // console.log(`${isUpdate ? 'Updated' : 'Created'} ${tableName} record, ID: `, result.recordId)
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: {},
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }

  // const createOrUpdateTable = async (
  //   DBConnect: DBConnectType,
  //   db: DatabaseMethodsType,
  //   tableName: string,
  //   record: { [key: string]: object | string }
  // ) => {
  //   const tableAndFields = await DBConnect.getDatabaseInfo(tableName)

  //   if (tableAndFields.length === 0) await db.createTable(tableName)

  //   const fieldsToCreate = Object.entries(record)
  //     .filter(([fieldName]) => !tableAndFields.find(({ column_name }) => column_name === fieldName))
  //     .map(([fieldName, value]) => ({ fieldName, fieldType: typeof value }))

  //   if (fieldsToCreate.length > 0) await db.createFields(tableName, fieldsToCreate)
}

export default sendNotification
