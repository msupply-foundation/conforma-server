import { FastifyReply, FastifyRequest } from 'fastify'
import path from 'path'
import { getSnapshotArchives } from '../../files/helpers'
import { SNAPSHOT_FOLDER } from '../../../constants'

type Query = {
  name: string
}

const routeFetchArchives = async (
  request: FastifyRequest<{ Querystring: Query }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name missing' })

  const archives = await getSnapshotArchives(path.join(SNAPSHOT_FOLDER, snapshotName))

  return reply.send({ success: true, archives })
}

export default routeFetchArchives
