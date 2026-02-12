import { FastifyReply, FastifyRequest } from 'fastify'
import { getSnapshotList } from './helpers'

const routeListSnapshots = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshots = await getSnapshotList()

  return reply.send(snapshots)
}

export default routeListSnapshots
