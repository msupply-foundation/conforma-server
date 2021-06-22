import { FastifyRequest, FastifyReply } from 'fastify'
import useSnapshot from '../useSnapshot'

type Query = {
  name?: string
}

const routeUseSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  // TODO can pass through options via post body
  const snapshotName = (request.query as Query).name

  reply.send(await useSnapshot({ snapshotName }))
}

export default routeUseSnapshot
