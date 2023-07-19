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

  const isArchive = (request.query as Query)?.archive === 'true'

  if (!snapshotName) {
    return reply.send({ ...errorMessageBase, error: 'snapshot "name" must be provided' })
  }

  const data = await request.files()

  const destFolder = path.join(SNAPSHOT_FOLDER, isArchive ? SNAPSHOT_ARCHIVES_FOLDER_NAME : '')

  const snapshotZipLocation = path.join(destFolder, snapshotName + '.zip')
  const snapshotLocation = path.join(destFolder, snapshotName)
  try {
    // data is a Promise, so we await it before looping
    for await (const file of data) {
      await pump(file.file, fs.createWriteStream(snapshotZipLocation))

      // Below synchronous operations are probably ok for snapshot routes
      const zip = new zipper(snapshotZipLocation)
      const snapshotMainFileName = `${SNAPSHOT_FILE_NAME}.json`

      if (
        !zip
          .getEntries()
          .find(
            ({ entryName }) => entryName === snapshotMainFileName || entryName === 'database.dump'
          )
      ) {
        return reply.send({
          ...errorMessageBase,
          error: `zip does not contain ${snapshotMainFileName}`,
        })
      }

      zip.extractAllTo(snapshotLocation, true)
    }
  } catch (e) {
    console.log(e)
    return reply.send({ ...errorMessageBase, error: 'check server logs' })
  }

  reply.send({ success: true, message: `uploaded snapshot ${snapshotName}` })
}

export default routeUploadSnapshot
