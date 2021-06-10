import { FastifyReply, FastifyRequest } from 'fastify'
import { getSnaphotList } from './helpers'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  reply.send(await getSnaphotList())
}

export default routeListSnapshots
