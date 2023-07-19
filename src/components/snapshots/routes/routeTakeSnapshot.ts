import { FastifyRequest, FastifyReply } from 'fastify'
import { ExportAndImportOptions } from '../../exportAndImport/types'
import takeSnapshot, { takeArchiveSnapshot } from '../takeSnapshot'

type Query = {
  name?: string
  archive?: 'true'
  optionsName?: string
}

const routeTakeSnapshot = async (request: FastifyRequest, reply: FastifyReply) => {
  const isArchive = (request.query as Query).archive === 'true'
  const snapshotName = (request.query as Query).name
  const optionsName = (request.query as Query).optionsName
  const extraOptions = (request.body || {}) as Partial<ExportAndImportOptions>

  reply.send(
    !isArchive
      ? await takeSnapshot({ snapshotName, optionsName, extraOptions })
      : await takeArchiveSnapshot({ snapshotName, optionsName, extraOptions })
  )
}

export default routeTakeSnapshot
