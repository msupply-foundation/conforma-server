import { FastifyReply, FastifyRequest } from 'fastify'
import path from 'path'
import { getSnapshotArchives } from '../../files/helpers'
import { SNAPSHOT_FOLDER } from '../../../constants'
import { ArchiveStore } from '../ArchiveStore'
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
    const archiveStore = await ArchiveStore.create()

    const archives = await getSnapshotArchives(path.join(SNAPSHOT_FOLDER, snapshotName))
    archives.forEach((archive) => {
      if (!archive.totalFileSize)
        archive.totalFileSize = archiveStore.getArchiveDetail(archive.uid)?.totalFileSize
    })

    return reply.send({ success: true, archives })
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
