import { FastifyRequest, FastifyReply } from 'fastify'
import { getZippedSnapshot } from '../zipFileHandler'

type Query = {
  name: string
}

type DownloadOptions = {
  includeSnapshot?: boolean
  archiveRange?: { from?: number; to?: number }
  zlibCompression?: number // 0-9, where 0 is no compression and 9 is maximum compression (default is 6)
}

const routeDownloadSnapshot = async (
  request: FastifyRequest<{ Querystring: Query; Body?: DownloadOptions }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name not specified' })

  const includeSnapshot = request?.body?.includeSnapshot ?? true
  const archiveRange = request?.body?.archiveRange ?? null
  const zlibCompression = request?.body?.zlibCompression ?? 6

  const zipFileName = await getZippedSnapshot({
    snapshotName,
    includeSnapshot,
    archiveRange,
    zlibCompression,
  })

  return reply.send({ success: true, message: 'Zip file ready', zipFileName })
}

export default routeDownloadSnapshot
