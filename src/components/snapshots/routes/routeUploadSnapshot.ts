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
import { convertSnapshotToNewStructure, timestampStringExpression } from './helpers'
import { DateTime } from 'luxon'
import StreamZip from 'node-stream-zip'
import config from '../../../config'
import { errorMessage } from '../../utilityFunctions'
import { copyArchivesIfMissing, ensureSnapshotSizes, listArchives } from '../snapshotStore'

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
  const tempZipLocation = path.join(SNAPSHOT_FOLDER, TEMP_ZIP_FILE)
  let zip: InstanceType<typeof StreamZip.async> | null = null
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

    console.log('Uploading snapshot:', snapshotName)

    await pump(upload.file, fs.createWriteStream(tempZipLocation))

    zip = new StreamZip.async({ file: tempZipLocation })

    const zipEntries = Object.values(await zip.entries())
    const files = zipEntries.map(({ name }) => name)

    let hasArchives = files.some((name) => name.startsWith(SNAPSHOT_ARCHIVES_FOLDER_NAME + '/'))

    let hasSnapshot = files.includes(INFO_FILE_NAME + '.json')
    if (!hasSnapshot) snapshotName = 'TEMP_SNAPSHOT_DESTINATION'

    const isOldStructure =
      snapshotName.startsWith('ARCHIVE_') ||
      files.some((name) => name.startsWith(`files/${ARCHIVE_SUBFOLDER_NAME}/`))

    console.log('snapshotName', snapshotName)

    if (isOldStructure) {
      // Old structure has a different way of determining if it's an
      // archive-only snapshot,
      if (snapshotName.startsWith('ARCHIVE_')) {
        hasSnapshot = false
        hasArchives = true
      }
      if (files.some((name) => name.startsWith(`files/${ARCHIVE_SUBFOLDER_NAME}/`)))
        hasArchives = true
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
      return reply.send({
        ...errorMessageBase,
        error: `Snapshot already exists: ${snapshotName}`,
      })
    }

    await fsx.ensureDir(snapshotDestination)
    await zip.extract(null, snapshotDestination)

    if (isOldStructure) {
      console.log('Converting to new snapshot structure...')
      const isArchiveOnly = await convertSnapshotToNewStructure(snapshotDestination)
      if (isArchiveOnly) {
        await fsx.remove(snapshotDestination)
        return reply.send({
          success: true,
          message: `Uploaded archive-only snapshot ${snapshotName}`,
          snapshot: snapshotName,
        })
      }
    }

    const isArchiveOnly = !hasSnapshot && hasArchives && !isOldStructure

    if (hasArchives && !isOldStructure) {
      // Copy the archives into the central archive store, then remove from
      // the snapshot.
      const archiveFolders = await fsx.readdir(
        path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME),
        'utf-8'
      )

      await copyArchivesIfMissing(
        archiveFolders,
        path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME)
      )
      await fsx.remove(path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME))
    }

    if (isArchiveOnly) {
      // Archives have been moved into the central store; the extraction
      // folder was just a temp staging area, so clean it up.
      await fsx.remove(snapshotDestination)
      return reply.send({
        success: true,
        message: 'Uploaded archives',
      })
    }

    // Snapshots from older servers may lack snapshotSize/archiveSize. Now
    // that the snapshot folder is in its final shape and any archives have
    // been moved into the central store, populate any missing fields.
    // Legacy conversions already wrote their sizes via convertSnapshotToNewStructure.
    if (hasSnapshot && !isOldStructure) {
      await ensureSnapshotSizes(snapshotDestination, await listArchives())
    }
  } catch (e) {
    console.log(e)
    return reply.send({ ...errorMessageBase, error: errorMessage(e) })
  } finally {
    if (zip) await zip.close().catch((err) => console.error('Failed to close zip:', err))
    await fsx
      .remove(tempZipLocation)
      .catch((err) => console.error('Failed to remove temp zip:', err))
  }

  reply.send({
    success: true,
    message: `Uploaded snapshot ${snapshotName}`,
    snapshot: snapshotName,
  })
}

export default routeUploadSnapshot
