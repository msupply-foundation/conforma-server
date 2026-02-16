import { FastifyRequest, FastifyReply } from 'fastify'
import useSnapshot from '../useSnapshot'
import { error } from 'console'
import { errorMessage } from '../../utilityFunctions'

const routeUseSnapshot = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name missing' })

  try {
    reply.send(await useSnapshot({ snapshotName }))
  } catch (e) {
    console.error('Error loading snapshot:', e)
    reply.send({
      success: false,
      message: 'There was a problem loading this snapshot',
      error: errorMessage(e),
    })
  }
}

export default routeUseSnapshot
