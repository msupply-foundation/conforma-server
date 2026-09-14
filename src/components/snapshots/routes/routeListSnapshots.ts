import { FastifyReply, FastifyRequest } from 'fastify'
import { findOrphanArchives, listArchives, listSnapshots } from '../snapshotStore'
import { getLiveArchiveFolders } from '../liveArchives'
import { errorMessage } from '../../utilityFunctions'

const routeListSnapshots = async (_: FastifyRequest, reply: FastifyReply) => {
  try {
    const archives = await listArchives()
    const snapshots = await listSnapshots(archives)

    // The orphan list must match what a purge would delete, so it is built
    // under the same live-database protection, queried after the listing
    // (see purgeOrphanArchives). When the database cannot answer, as during
    // a restore, the snapshot list is still served but no orphans are
    // offered: without the database there is no way to know which are safe.
    let orphanArchives: string[] = []
    let liveArchivesUnavailable = false
    try {
      orphanArchives = findOrphanArchives(archives, snapshots, await getLiveArchiveFolders())
    } catch (e) {
      liveArchivesUnavailable = true
      console.log('Orphan archives not offered, database unavailable:', errorMessage(e))
    }

    return reply.send({ snapshots, orphanArchives, liveArchivesUnavailable })
  } catch (e) {
    return reply.send({
      success: false,
      message: 'Error fetching snapshot list',
      error: errorMessage(e),
    })
  }
}

export default routeListSnapshots
