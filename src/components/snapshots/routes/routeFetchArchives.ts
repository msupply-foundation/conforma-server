import { FastifyReply, FastifyRequest } from 'fastify'
import path from 'path'
import { getSnapshotArchives } from '../../files/helpers'
import { SNAPSHOT_FOLDER } from '../../../constants'
import { listArchives } from '../snapshotStore'
import { errorMessage } from '../../utilityFunctions'

type Query = {
  name: string
}

const routeFetchArchives = async (
  request: FastifyRequest<{ Querystring: Query }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name missing' })

  try {
    const archives = await listArchives()

    const snapshotArchives = await getSnapshotArchives(path.join(SNAPSHOT_FOLDER, snapshotName))
    snapshotArchives.forEach((archive) => {
      if (!archive.totalFileSize) archive.totalFileSize = archives[archive.uid]?.totalFileSize
    })

    return reply.send({ success: true, archives: snapshotArchives })
  } catch (error) {
    console.error('Error fetching archives:', error)
    return reply.send({
      success: false,
      message: 'Error fetching archives',
      error: errorMessage(error),
    })
  }
}

export default routeFetchArchives
