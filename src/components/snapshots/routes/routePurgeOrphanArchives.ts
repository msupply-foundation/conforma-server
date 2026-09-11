import { FastifyRequest, FastifyReply } from 'fastify'
import DBConnect from '../../database/databaseConnect'
import { errorMessage } from '../../utilityFunctions'
import { purgeOrphanArchives, referencedArchiveFolders } from '../snapshotStore'

const routePurgeOrphanArchives = async (_: FastifyRequest, reply: FastifyReply) => {
  console.log('Purge orphan archives request received')
  try {
    const liveArchiveFolders = referencedArchiveFolders(await DBConnect.getReferencedArchives())
    const { purged, keptForDatabase } = await purgeOrphanArchives(liveArchiveFolders)
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
