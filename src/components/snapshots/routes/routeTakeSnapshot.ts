import { FastifyRequest, FastifyReply } from 'fastify'
import { ExportAndImportOptions } from '../../exportAndImport/types'
import takeSnapshot from '../takeSnapshot'

type Query = {
  name?: string
  optionsName?: string
}

const routeTakeSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  // TODO can pass through options via post body
  const snapshotName = (request.query as Query).name
  const optionsName = (request.query as Query).optionsName
  const extraOptions = (request.body || {}) as Partial<ExportAndImportOptions>

  reply.send(await takeSnapshot({ snapshotName, optionsName, extraOptions }))
}

export default routeTakeSnapshot
