import { FastifyReply, FastifyRequest } from 'fastify'
import { ArchiveStore } from '../ArchiveStore'
import { getCurrentArchives } from '../../files/helpers'
import { errorMessage } from '../../utilityFunctions'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  const archiveStore = await ArchiveStore.create()

  const snapshots = await archiveStore.getSnapshots()

  const orphanArchives = await archiveStore.getOrphans()

  const fullArchiveList = archiveStore.getArchiveList()

  const currentArchives = (await getCurrentArchives()).map((archive) => archive.archiveFolder)

  const archivesNotInStore = currentArchives.filter((archive) => !fullArchiveList.includes(archive))

  try {
    return reply.send({ snapshots, orphanArchives, archivesNotInStore })
  } catch (e) {
    return reply.send({
      success: false,
      message: 'Error fetching snapshot list',
      error: errorMessage(e),
    })
  }
}

export default routeListSnapshots
