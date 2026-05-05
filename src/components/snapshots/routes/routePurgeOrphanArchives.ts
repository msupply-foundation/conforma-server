import { FastifyRequest, FastifyReply } from 'fastify'
import { errorMessage } from '../../utilityFunctions'
import { purgeOrphanArchives } from '../snapshotStore'

const routePurgeOrphanArchives = async (_: FastifyRequest, reply: FastifyReply) => {
  console.log('Purge orphan archives request received')
  try {
    const orphans = await purgeOrphanArchives()
    console.log('Purging...Done')

    return reply.send({ success: true, message: 'Purged orphan archives', orphans })
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
