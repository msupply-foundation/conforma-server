import { FastifyRequest, FastifyReply } from 'fastify'
import useSnapshot from '../useSnapshot'

type Query = {
  name?: string
  optionsName?: string
}

const routeUseSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  // TODO can pass through options via post body
  const snapshotName = (request.query as Query).name
  const optionsName = (request.query as Query).optionsName

  reply.send(await useSnapshot({ snapshotName, optionsName }))
}

export default routeUseSnapshot
