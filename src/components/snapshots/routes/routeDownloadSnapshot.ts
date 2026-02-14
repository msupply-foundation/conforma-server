import { FastifyRequest, FastifyReply } from 'fastify'
import { getZippedSnapshot } from '../zipFileHandler'

type Query = {
  name: string
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

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name not specified' })

  const includeSnapshot = request?.body?.includeSnapshot ?? true
  const archiveRange = request?.body?.archiveRange ?? null

  console.log('request?.body', request?.body)

  const zipFileName = await getZippedSnapshot(snapshotName, includeSnapshot, archiveRange)

  return reply.send({ success: true, message: 'Zip file ready', zipFileName })
}

export default routeDownloadSnapshot
