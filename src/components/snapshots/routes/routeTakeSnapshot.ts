import { FastifyRequest, FastifyReply } from 'fastify'
import takeSnapshot from '../takeSnapshot'

type Query = {
  name?: string
}

const routeTakeSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const snapshotName = (request.query as Query).name

  reply.send(await takeSnapshot({ snapshotName }))
}

export default routeTakeSnapshot
