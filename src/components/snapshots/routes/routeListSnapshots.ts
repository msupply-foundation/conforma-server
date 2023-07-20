import { FastifyReply, FastifyRequest } from 'fastify'
import { getCurrentArchiveList, getSnapshotList } from './helpers'

const routeListSnapshots = async (request: FastifyRequest, reply: FastifyReply) => {
  const currentArchives = await getCurrentArchiveList()
  const type = (request.query as { archive?: 'true' })?.archive ? 'archives' : 'snapshots'
  const snapshots = type === 'snapshots' ? await getSnapshotList() : await getSnapshotList(true)

  return reply.send({ snapshots, currentArchives })
}

export default routeListSnapshots
