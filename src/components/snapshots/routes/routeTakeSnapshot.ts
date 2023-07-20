import { FastifyRequest, FastifyReply } from 'fastify'
import { ExportAndImportOptions } from '../../exportAndImport/types'
import takeSnapshot from '../takeSnapshot'

type Query = {
  name?: string
  archive?: 'true'
  optionsName?: string
}

const routeTakeSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const isArchive = (request.query as Query).archive === 'true'
  const snapshotName = (request.query as Query).name
  const optionsName = isArchive ? 'archive' : (request.query as Query).optionsName
  const extraOptions = (request.body || {}) as Partial<ExportAndImportOptions>

  reply.send(
    !isArchive
      ? await takeSnapshot({ snapshotName, optionsName, extraOptions })
      : await takeSnapshot({ snapshotName, optionsName, extraOptions, isArchiveSnapshot: true })
  )
}

export default routeTakeSnapshot
