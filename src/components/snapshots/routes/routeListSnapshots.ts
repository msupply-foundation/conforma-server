import { FastifyReply, FastifyRequest } from 'fastify'
import { getCurrentArchiveList, getSnapshotArchiveList, getSnapshotList } from './helpers'

const routeListSnapshots = async (request: FastifyRequest, reply: FastifyReply) => {
  const currentArchives = await getCurrentArchiveList()
  const type = (request.query as { archive?: 'true' })?.archive ? 'archives' : 'snapshots'
  const snapshots = type === 'snapshots' ? await getSnapshotList() : await getSnapshotArchiveList()

  return reply.send({ snapshots, currentArchives })
}

export default routeListSnapshots
