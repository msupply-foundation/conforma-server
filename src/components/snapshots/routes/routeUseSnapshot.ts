import { FastifyRequest, FastifyReply } from 'fastify'
import useSnapshot from '../useSnapshot'

const routeUseSnapshot = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name missing' })

  reply.send(await useSnapshot({ snapshotName }))
}

export default routeUseSnapshot
