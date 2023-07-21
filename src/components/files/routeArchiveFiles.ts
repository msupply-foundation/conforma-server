import { FastifyReply, FastifyRequest } from 'fastify'
import { combineRequestParams } from '../utilityFunctions'
import archiveFiles from './archive'

const routeArchiveFiles = async (request: FastifyRequest, reply: FastifyReply) => {
  const { days } = combineRequestParams(request)

  const result = await archiveFiles(
    Number.isNaN(Number.parseInt(days)) ? undefined : Number.parseInt(days)
  )

  return reply.send(result)
}

export default routeArchiveFiles
