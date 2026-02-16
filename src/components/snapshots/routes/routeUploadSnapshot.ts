import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import {
  ARCHIVE_SUBFOLDER_NAME,
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  SNAPSHOT_FILE_NAME,
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

  console.log('upload.filename', upload.filename)

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

    console.log('Processed snapshot name:', snapshotName)

    const tempZipLocation = path.join(SNAPSHOT_FOLDER, TEMP_ZIP_FILE)

    await pump(upload.file, fs.createWriteStream(tempZipLocation))

    const zip = new StreamZip.async({ file: tempZipLocation })

    const zipEntries = Object.values(await zip.entries())
    const files = zipEntries.map(({ name }) => name)

    const hasArchives = files.some((name) => name.startsWith(SNAPSHOT_ARCHIVES_FOLDER_NAME + '/'))

    const hasSnapshot = files.includes(INFO_FILE_NAME + '.json')

    const isOldStructure =
      snapshotName.startsWith('ARCHIVE_') ||
      files.some((name) => name.startsWith(`files/${ARCHIVE_SUBFOLDER_NAME}/`))

    console.log('hasArchives', hasArchives)
    console.log('hasSnapshot', hasSnapshot)
    console.log('isOldStructure', isOldStructure)

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

    const zipEntryData = await zip.entryData('info.json')
    const info = JSON.parse(zipEntryData?.toString() || '{}')

    // Add timestamp suffix to upload name if it doesn't already have it. But
    // we don't want this on template uploads as the front-end needs to refer
    // to them by name, and we delete them immediately after anyway
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

    fs.mkdirSync(snapshotDestination)
    await zip.extract(null, snapshotDestination)

    if (hasArchives) {
      const archiveStore = await ArchiveStore.create()
      // Copy the archives to the archive store
      const archiveFolders = (
        await fsx.readdir(path.join(snapshotDestination, SNAPSHOT_ARCHIVES_FOLDER_NAME), 'utf-8')
      ).map((archiveFolder) => ({ archiveFolder }))

      archiveStore.copyTo(archiveFolders as ArchiveInfo[])
    }

    if (hasSnapshot) {
      // zip.extract can error if destination dir doesn't already exist
      fs.mkdirSync(snapshotDestination)
      await zip.extract(null, snapshotDestination)
    }

    if (hasArchives) {
      const archiveStore = await ArchiveStore.create()

      // Extract archives to temporary location
      const tempArchivesPath = path.join(SNAPSHOT_FOLDER, `temp_archives_${Date.now()}`)
      fs.mkdirSync(tempArchivesPath, { recursive: true })

      const archiveFolders = files
        .filter((name) => name.startsWith(SNAPSHOT_ARCHIVES_FOLDER_NAME + '/'))
        .map((name) => name.split('/')[1])
        .filter((folder, index, self) => folder && self.indexOf(folder) === index)

      for (const folder of archiveFolders) {
        await zip.extract(
          `${SNAPSHOT_ARCHIVES_FOLDER_NAME}/${folder}`,
          path.join(tempArchivesPath, folder)
        )
      }
      // archiveStore.copyTo()
    }

    await zip.close()

    // Move/rename original zip if filename has changed, or if it's an archive
    fs.rename(tempZipLocation, path.join(SNAPSHOT_FOLDER, snapshotName + '.zip'), () => {})
  } catch (e) {
    console.log(e)
    return reply.send({ ...errorMessageBase, error: 'check server logs' })
  }

  reply.send({
    success: true,
    message: `uploaded snapshot ${snapshotName}`,
    snapshot: snapshotName,
  })
}

export default routeUploadSnapshot
