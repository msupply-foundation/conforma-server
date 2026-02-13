import { FastifyReply, FastifyRequest } from 'fastify'
import fsx from 'fs-extra'
import { getSnapshotList } from './helpers'
import { ArchiveStore } from '../ArchiveStore'
import { ARCHIVE_FOLDER } from '../../../constants'
import { getCurrentArchives } from '../../files/helpers'

const routeListSnapshots = async (request: FastifyRequest, reply: FastifyReply) => {
  const archiveStore = await ArchiveStore.create()

  const snapshots = await getSnapshotList(archiveStore)
  const orphanArchives = await archiveStore.getOrphans()

  const fullArchiveList = archiveStore.getArchiveList()

  const currentArchives = (await getCurrentArchives()).map((archive) => archive.archiveFolder)

  const archivesNotInStore = currentArchives.filter((archive) => !fullArchiveList.includes(archive))

  return reply.send({ snapshots, orphanArchives, archivesNotInStore })
}

export default routeListSnapshots
