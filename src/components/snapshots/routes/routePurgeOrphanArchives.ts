import { FastifyRequest, FastifyReply } from 'fastify'
import { errorMessage } from '../../utilityFunctions'
import { purgeOrphanArchives } from '../snapshotStore'
import { getLiveArchiveFolders } from '../liveArchives'

const routePurgeOrphanArchives = async (_: FastifyRequest, reply: FastifyReply) => {
  console.log('Purge orphan archives request received')
  try {
    const { purged, keptForDatabase } = await purgeOrphanArchives(getLiveArchiveFolders)
    console.log('Purging...Done')

    const kept =
      keptForDatabase > 0
        ? ` ${keptForDatabase} archive(s) listed by no snapshot were kept because the current database references them.`
        : ''
    return reply.send({
      success: true,
      message: `Purged ${purged.length} orphan archive(s).${kept}`,
      orphans: purged,
      keptForDatabase,
    })
  } catch (e) {
    console.error('Error while purging orphan archives:', e)
    return reply.send({
      success: false,
      message: 'Error while purging orphan archives',
      error: errorMessage(e),
    })
  }
}

export default routePurgeOrphanArchives
