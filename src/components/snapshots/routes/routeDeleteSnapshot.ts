import { FastifyRequest, FastifyReply } from 'fastify'
import { promisify } from 'util'
import rimraf from 'rimraf'
import path from 'path'
import { SNAPSHOT_FOLDER } from '../../../constants'
import { errorMessage } from '../../utilityFunctions'

const asyncRimRaf = promisify(rimraf)

type Query = { name?: string }

const routeDeleteSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshotName = (request.query as Query)?.name as string
  if (!snapshotName) return reply.send({ success: false, message: 'No snapshot name provided' })

  console.log('Deleting snapshot:', snapshotName)
  try {
    await asyncRimRaf(path.join(SNAPSHOT_FOLDER, snapshotName))
    reply.send({ success: true })
  } catch (e) {
    reply.send({
      success: false,
      message: 'Problem deleting snapshot ' + snapshotName,
      error: errorMessage(e),
    })
  }
}

export default routeDeleteSnapshot
