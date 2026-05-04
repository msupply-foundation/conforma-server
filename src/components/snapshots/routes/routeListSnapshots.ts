import { FastifyReply, FastifyRequest } from 'fastify'
import { ArchiveStore } from '../ArchiveStore'
import { errorMessage } from '../../utilityFunctions'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  const archiveStore = await ArchiveStore.create()

  const snapshots = archiveStore.getSnapshots()

  const orphanArchives = archiveStore.getOrphans()

  try {
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
