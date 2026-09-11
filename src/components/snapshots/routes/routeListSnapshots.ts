import { FastifyReply, FastifyRequest } from 'fastify'
import DBConnect from '../../database/databaseConnect'
import {
  findOrphanArchives,
  listArchives,
  listSnapshots,
  referencedArchiveFolders,
} from '../snapshotStore'
import { errorMessage } from '../../utilityFunctions'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const archives = await listArchives()
    const snapshots = await listSnapshots(archives)
    // The orphan list must match what a purge would delete, so it is
    // computed with the same live-database protection
    const liveArchiveFolders = referencedArchiveFolders(await DBConnect.getReferencedArchives())
    const orphanArchives = findOrphanArchives(archives, snapshots, liveArchiveFolders)

    return reply.send({ snapshots, orphanArchives })
  } catch (e) {
    return reply.send({
      success: false,
      message: 'Error fetching snapshot list',
      error: errorMessage(e),
    })
  }
}

export default routeListSnapshots
