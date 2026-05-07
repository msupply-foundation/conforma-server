import { FastifyReply, FastifyRequest } from 'fastify'
import { findOrphanArchives, listArchives, listSnapshots } from '../snapshotStore'
import { errorMessage } from '../../utilityFunctions'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const archives = await listArchives()
    const snapshots = await listSnapshots(archives)
    const orphanArchives = findOrphanArchives(archives, snapshots)

    return reply.send({ snapshots, orphanArchives })
  } catch (e) {
    return reply.send({
      success: false,
      message: 'Error fetching snapshot list',
      error: errorMessage(e),
    })
  }
}

export default routeListSnapshots
