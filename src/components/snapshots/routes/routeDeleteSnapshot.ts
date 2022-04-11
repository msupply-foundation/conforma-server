import { FastifyRequest, FastifyReply } from 'fastify'
import { promisify } from 'util'
import rimraf from 'rimraf'
import path from 'path'
import { SNAPSHOT_FOLDER } from '../../../constants'

const asyncRimRaf = promisify(rimraf)

type Query = {
  name?: string
}

const routeDeleteSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshotName = (request.query as Query)?.name
  if (!snapshotName) reply.send({ success: false, message: 'No snapshot name provided' })

  try {
    await asyncRimRaf(path.join(SNAPSHOT_FOLDER, snapshotName as string))
    // Also delete the .zip if it exists
    await asyncRimRaf(path.join(SNAPSHOT_FOLDER, `${snapshotName}.zip`))
    reply.send({ success: true })
  } catch (e) {
    reply.send({
      success: false,
      message: 'Problem deleting snapshot ' + snapshotName,
      error: e.toString(),
    })
  }
}

export default routeDeleteSnapshot
