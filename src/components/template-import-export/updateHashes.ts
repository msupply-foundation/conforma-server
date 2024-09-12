import db from './databaseMethods'
import { createHash } from 'crypto'

interface NotificationPayload {
  tableName: string
  id: number
}

export const hashRecord = async ({ tableName, id }: NotificationPayload) => {
  const data = await db.getRecord(tableName, id)
  const oldChecksum = data.checksum
  delete data.id
  delete data.checksum
  delete data.last_modified

  // Remove foreign_key ids and replace with the actual data they refer to
  if (tableName === 'permission_name') {
    const policyId = data.permission_policy_id
    delete data.permission_policy_id
    data.permission_policy = (await db.getRecord('permission_policy', policyId)) ?? null
  }

  const checksum = getHash(data)

  if (checksum !== oldChecksum) {
    // Don't update if checksum hasn't changed, otherwise gets into infinite
    // loop
    console.log(`Updating checksum for Record ${id} on ${tableName}`)
    await db.updateChecksum(tableName, id, checksum)
  }
}

export const getHash = (data: unknown) => {
  const hash = createHash('sha256')
  hash.update(JSON.stringify(data))
  return hash.digest('hex')
}
