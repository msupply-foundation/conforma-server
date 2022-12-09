import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import databaseMethods from './databaseMethods'
import { nanoid } from 'nanoid'
import { DateTime } from 'luxon'

const createVerification: ActionPluginType = async ({ parameters, applicationData, DBConnect }) => {
  const db = databaseMethods(DBConnect)
  const {
    applicationId = applicationData?.applicationId,
    expiry = null, // duration in hours
    uniqueId = getUrlSafeId(),
    message = '## Verification successful\n\nThank you',
    eventCode = null,
    data = null,
  } = parameters

  try {
    const expiryTime = expiry ? DateTime.now().plus({ hours: expiry }).toISO() : null
    // Add record
    const verification = await db.createVerification({
      uniqueId,
      applicationId,
      expiryTime,
      eventCode,
      message,
      data,
    })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { verification },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

// If a url ends in an "_", most email clients and markdown processors don't
// parse it as part of the url when creating auto-links. So for safety, we'll
// make sure verification Ids don't end with "_" -- the last character gets
// replaced with a random alphanumeric character if so.
const getUrlSafeId = (size: number = 24) => {
  const id = nanoid(size)

  if (id[size - 1] !== '_') return id

  const availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return id.slice(0, size - 1) + availableChars[Math.floor(Math.random() * 62)]
}

export default createVerification
