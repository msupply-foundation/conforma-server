import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import {
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  SNAPSHOT_FILE_NAME,
  SNAPSHOT_FOLDER,
} from '../../../constants'
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import zipper from 'adm-zip'
const pump = promisify(pipeline)

type Query = {
  name?: string
  archive?: string
}

const errorMessageBase = {
  success: false,
  message: 'failed to upload snapshot',
}

const routeUploadSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshotName = (request.query as Query).name

  if (!snapshotName) {
    return reply.send({ ...errorMessageBase, error: 'snapshot "name" must be provided' })
  }

  const data = await request.files()

  const snapshotZipLocation = path.join(SNAPSHOT_FOLDER, snapshotName + '.zip')
  const snapshotLocation = path.join(SNAPSHOT_FOLDER, snapshotName)
  try {
    // data is a Promise, so we await it before looping
    for await (const file of data) {
      await pump(file.file, fs.createWriteStream(snapshotZipLocation))

      // Below synchronous operations are probably ok for snapshot routes
      const zip = new zipper(snapshotZipLocation)

      const files = zip.getEntries().map(({ entryName }) => entryName)

      if (!files.includes('info.json')) {
        return reply.send({
          ...errorMessageBase,
          error: `Invalid Snapshot or Archive .zip`,
        })
      }

      const isOldSnapshot = files.includes(`${SNAPSHOT_FILE_NAME}.json`)
      const isArchive = !files.includes('database.dump') && !isOldSnapshot

      const destination = isArchive
        ? path.join(SNAPSHOT_FOLDER, SNAPSHOT_ARCHIVES_FOLDER_NAME, snapshotName)
        : snapshotLocation

      zip.extractAllTo(destination, true)

      if (isArchive)
        fs.rename(
          snapshotZipLocation,
          path.join(SNAPSHOT_FOLDER, SNAPSHOT_ARCHIVES_FOLDER_NAME, snapshotName + '.zip'),
          () => {}
        )
    }
  } catch (e) {
    console.log(e)
    return reply.send({ ...errorMessageBase, error: 'check server logs' })
  }

  reply.send({ success: true, message: `uploaded snapshot ${snapshotName}` })
}

export default routeUploadSnapshot
