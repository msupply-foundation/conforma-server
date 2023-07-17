import { FastifyReply, FastifyRequest } from 'fastify'
import { getSnapshotArchiveList, getSnapshotList } from './helpers'

const routeListSnapshots = async (request: FastifyRequest, reply: FastifyReply) => {
  const type = (request.query as { archive?: 'true' })?.archive ? 'archives' : 'snapshots'
  if (type === 'snapshots') return reply.send(await getSnapshotList())
  return reply.send(await getSnapshotArchiveList())
}

export default routeListSnapshots
