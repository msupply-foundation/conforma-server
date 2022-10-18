import takeSnapshot from '../snapshots/takeSnapshot'
import archiver from 'archiver'
// @ts-ignore -- no type declarations
import archiverZipEncrypted from 'archiver-zip-encrypted'
import { DateTime } from 'luxon'
import fs from 'fs'
import path from 'path'
import config from '../../config'
import { SNAPSHOT_FOLDER, BACKUPS_FOLDER } from '../../constants'
import { execSync } from 'child_process'

archiver.registerFormat('zip-encrypted', archiverZipEncrypted)

const { backupFilePrefix = 'conforma_backup', maxBackupDurationDays } = config

const isManualBackup: Boolean = process.argv[2] === '--backup'
const passwordArg: string | undefined = process.argv[3]

const createBackup = async (password?: string) => {
  // Take snapshot
  const snapshotName = `${backupFilePrefix}_${DateTime.now().toFormat('yyyy-LL-dd_HH-mm-ss')}`

  console.log(`Creating system backup: ${snapshotName}`)

  if (!password) console.log('WARNING: Backup is not encrypted')

  await takeSnapshot({ snapshotName, optionsName: 'backup' })

  // Zip it using password (or unencrypted if no password)
  const output = fs.createWriteStream(path.join(BACKUPS_FOLDER, `${snapshotName}.zip`))
  const archive = password
    ? archiver.create('zip-encrypted', {
        zlib: { level: 9 },
        encryptionMethod: 'aes256',
        password,
      } as any)
    : archiver('zip', { zlib: { level: 9 } })

  output.on('close', () => {
    console.log(`Backup done`)
    execSync(`rm -rf ${path.join(SNAPSHOT_FOLDER, snapshotName)}`)
    cleanUpBackups().then(() => {
      if (isManualBackup) process.exit(0)
    })
  })

  output.on('error', (err) => {
    console.log('Problem creating backup: ', err.message)
    execSync(`rm -rf ${path.join(SNAPSHOT_FOLDER, snapshotName)}`)
    cleanUpBackups().then(() => {
      if (isManualBackup) process.exit(0)
    })
  })

  archive.pipe(output)
  archive.directory(path.join(SNAPSHOT_FOLDER, snapshotName), false)
  archive.finalize()
}

// For running backup manually using `yarn backup`
if (isManualBackup) {
  createBackup(passwordArg)
}

const cleanUpBackups = async () => {
  const maxDaysToKeep = config.maxBackupDurationDays
  if (!maxDaysToKeep) return

  console.log(`Removing backups older than ${maxDaysToKeep} days`)
  const backups = await fs.promises.readdir(BACKUPS_FOLDER)

  let deletedCount = 0

  for (const backup of backups) {
    if (path.extname(backup) !== '.zip') continue

    const backupCreatedTime = await (
      await fs.promises.stat(path.join(BACKUPS_FOLDER, backup))
    ).ctime
    const backupAgeInDays = DateTime.now().diff(DateTime.fromJSDate(backupCreatedTime)).as('days')
    if (backupAgeInDays > maxDaysToKeep) {
      await fs.promises.unlink(path.join(BACKUPS_FOLDER, backup))
      deletedCount++
    }
  }

  console.log(` - ${deletedCount} backup(s) deleted`)
}

export default createBackup
