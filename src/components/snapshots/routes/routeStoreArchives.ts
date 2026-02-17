import { FastifyRequest, FastifyReply } from 'fastify'
import { errorMessage } from '../../utilityFunctions'
import { getCurrentArchives } from '../../files/helpers'
import { ArchiveStore } from '../ArchiveStore'

const routeStoreArchives = async (_: FastifyRequest, reply: FastifyReply) => {
  console.log('Storing current system archives in snapshot store...')

  try {
    const archiveStore = await ArchiveStore.create()

    const currentArchives = await getCurrentArchives()
    await archiveStore.copyTo(currentArchives)

    return reply.send({ success: true, message: 'Archived copied to store' })
  } catch (e) {
    console.error('Error while storing archives:', e)
    return reply.send({
      success: false,
      message: 'Error while storing archives',
      error: errorMessage(e),
    })
  }
}

export default routeStoreArchives
