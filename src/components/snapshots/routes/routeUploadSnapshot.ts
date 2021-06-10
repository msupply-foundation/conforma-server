import { FastifyRequest, FastifyReply } from 'fastify'
import path from 'path'
import { SNAPSHOT_FILE_NAME, SNAPSHOT_FOLDER } from '../constants'
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import zipper from 'adm-zip'
const pump = promisify(pipeline)

type Query = {
  name?: string
}

const erroMessageBase = {
  success: false,
  message: 'failed to upload snapshot',
}

const routeUploadSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshotName = (request.query as Query).name

  if (!snapshotName) {
    return reply.send({ ...erroMessageBase, error: 'snapshot "name" must be provided' })
  }

  const data = await request.files()

  const snapshotZipLocation = path.join(SNAPSHOT_FOLDER, snapshotName + '.zip')
  const snapshotLocation = path.join(SNAPSHOT_FOLDER, snapshotName)
  try {
    // data is a Promise, so we await it before looping
    for await (const file of data) {
      await pump(file.file, fs.createWriteStream(snapshotZipLocation))

      // Below syncrhonous opperations are probably ok for snapshot routes
      const zip = new zipper(snapshotZipLocation)
      const snapshotMainFileName = `${SNAPSHOT_FILE_NAME}.json`

      if (!zip.getEntries().find(({ entryName }) => entryName === snapshotMainFileName)) {
        return reply.send({
          ...erroMessageBase,
          error: `zip does not container ${snapshotMainFileName}`,
        })
      }

      zip.extractAllTo(snapshotLocation, true)
    }
  } catch (e) {
    console.log(e)
    return reply.send({ ...erroMessageBase, error: 'check server logs' })
  }

  reply.send({ success: true, message: `uploaded snapshot ${snapshotName}` })
}

export default routeUploadSnapshot
