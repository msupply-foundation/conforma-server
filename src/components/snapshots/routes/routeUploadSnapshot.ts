import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import {
  ARCHIVE_SUBFOLDER_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  SNAPSHOT_FOLDER,
} from '../../../constants'
import fs from 'fs'
import fsx from 'fs-extra'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { timestampStringExpression } from './helpers'
import { DateTime } from 'luxon'
import StreamZip from 'node-stream-zip'
import config from '../../../config'
import { errorMessage } from '../../utilityFunctions'
import { ArchiveStore } from '../ArchiveStore'
import { ArchiveInfo } from '../../files/archive'

const pump = promisify(pipeline)

const errorMessageBase = {
  success: false,
  message: 'Failed to upload snapshot',
}

const TEMP_ZIP_FILE = 'tempUpload.zip'

const routeUploadSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  let upload
  try {
    upload = await request.file()
    if (!upload) return reply.send({ ...errorMessageBase, error: 'No file attached' })
  } catch (err) {
    return reply.send({ ...errorMessageBase, error: errorMessage(err) })
  }

  if (upload.file.truncated)
    return reply.send({
      ...errorMessageBase,
      error: `Uploaded file too big (Limit ${config.fileUploadLimit} bytes)`,
    })

  let snapshotName: string = ''
  try {
    snapshotName = upload.filename
      // Remove ".zip" file extension
      .replace(/\.zip$/g, '')
      // Remove (1) from end (added due to multiple downloads of same file)
      .replace(/(\(\d+\))$/g, '')
      // Remove archive suffix patterns like " [+ARCHIVE 2023_07_27-2023_07_27]"
      // or " - ARCHIVE ONLY 2023_07_27-2023_07_27"
      .replace(/(\s+\[\+ARCHIVE\s+[\d_-]+\]|\s+-\s+ARCHIVE\s+ONLY\s+[\d_-]+)$/g, '')
      // Restrict filename to alpha-numeric chars (and "-"/"_")
      .replace(/[^\w\d-]/g, '_')

    const tempZipLocation = path.join(SNAPSHOT_FOLDER, TEMP_ZIP_FILE)

    await pump(upload.file, fs.createWriteStream(tempZipLocation))

    const zip = new StreamZip.async({ file: tempZipLocation })

    const zipEntries = Object.values(await zip.entries())
    const files = zipEntries.map(({ name }) => name)

    const hasArchives = files.some((name) => name.startsWith(SNAPSHOT_ARCHIVES_FOLDER_NAME + '/'))

    const hasSnapshot = files.includes(INFO_FILE_NAME + '.json')
    if (!hasSnapshot) snapshotName = 'TEMP_SNAPSHOT_DESTINATION'

    const isOldStructure =
      snapshotName.startsWith('ARCHIVE_') ||
      files.some((name) => name.startsWith(`files/${ARCHIVE_SUBFOLDER_NAME}/`))

    if (isOldStructure) {
      // TO-DO -- handle this
      return reply.send({
        success: true,
        message: `uploaded snapshot ${snapshotName}`,
        snapshot: snapshotName,
      })
    }

    if (!hasSnapshot && !hasArchives) {
      return reply.send({
        ...errorMessageBase,
        error: 'Invalid Snapshot .zip -- has neither snapshot info nor archives',
      })
    }

    let info: { timestamp: string } = { timestamp: DateTime.now().toISO() }
    try {
      const zipEntryData = await zip.entryData('info.json')
      info = JSON.parse(zipEntryData?.toString() || '{}')
    } catch {
      // Archive only snapshot, use current timestamp
    }

    // Add timestamp suffix to upload name if it doesn't already have it.
    if (!timestampStringExpression.test(snapshotName))
      snapshotName =
        snapshotName + DateTime.fromISO(info.timestamp).toFormat('_yyyy-LL-dd_HH-mm-ss')

    const snapshotDestination = path.join(SNAPSHOT_FOLDER, snapshotName)

    // Make sure snapshot doesn't already exist
    if (hasSnapshot && fs.existsSync(snapshotDestination)) {
      fs.unlink(path.join(SNAPSHOT_FOLDER, TEMP_ZIP_FILE), () => {})
      {
        return reply.send({
          ...errorMessageBase,
          error: `Snapshot already exists: ${snapshotName}`,
        })
      }
    }

    await fsx.ensureDir(snapshotDestination)
    await zip.extract(null, snapshotDestination)

    if (hasArchives) {
      const archiveStore = await ArchiveStore.create()
      // Copy the archives to the archive store, then remove from snapshot
      const archiveFolders = (
        await fsx.readdir(path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME), 'utf-8')
      ).map((archiveFolder) => ({ archiveFolder }))

      archiveStore.copyTo(archiveFolders as ArchiveInfo[])
      await fsx.remove(path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME))
    }

    await zip.close()

    // Remove original zip file
    await fsx.remove(snapshotDestination)
  } catch (e) {
    console.log(e)
    return reply.send({ ...errorMessageBase, error: errorMessage(e) })
  }

  reply.send({
    success: true,
    message: `Uploaded snapshot ${snapshotName}`,
    snapshot: snapshotName,
  })
}

export default routeUploadSnapshot
