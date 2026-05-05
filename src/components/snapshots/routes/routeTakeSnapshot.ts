import { FastifyRequest, FastifyReply } from 'fastify'
import { ArchiveOption, SnapshotType } from '../../exportAndImport/types'
import takeSnapshot from '../takeSnapshot'
import { errorMessage } from '../../utilityFunctions'

type Query = {
  name?: string
  type?: SnapshotType
}

const routeTakeSnapshot = async (
  request: FastifyRequest<{ Querystring: Query }>,
  reply: FastifyReply
) => {
  const snapshotType = request.query.type
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'error while loading snapshot' })

  try {
    reply.send(await takeSnapshot({ snapshotName, snapshotType }))
  } catch (e) {
    console.error('Error taking snapshot:', e)
    reply.send({
      success: false,
      message: 'There was a problem saving this snapshot',
      error: errorMessage(e),
    })
  }
}

export default routeTakeSnapshot
