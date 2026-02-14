import { FastifyRequest, FastifyReply } from 'fastify'
import { getZippedSnapshot } from '../zipFileHandler'
import { createReadStream } from 'fs'

type Query = {
  name: string
  filename?: string
}

type DownloadOptions = {
  includeSnapshot?: boolean
  archiveRange?: { from?: number; to?: number }
}

const routeDownloadSnapshot = async (
  request: FastifyRequest<{ Querystring: Query; Body?: DownloadOptions }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name
  const customFilename = request.query.filename

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name not specified' })

  const includeSnapshot = request?.body?.includeSnapshot ?? true
  const archiveRange = request?.body?.archiveRange ?? null

  const zipFilePath = await getZippedSnapshot(snapshotName, includeSnapshot, archiveRange)

  const filename = customFilename || `${snapshotName}.zip`

  reply.header('Content-Type', 'application/zip')
  reply.header('Content-Disposition', `attachment; filename="${filename}"`)

  return reply.send(createReadStream(zipFilePath))
}

export default routeDownloadSnapshot
