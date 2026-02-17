import { FastifyRequest, FastifyReply } from 'fastify'
import fsx from 'fs-extra'
import useSnapshot from '../useSnapshot'
import { errorMessage } from '../../utilityFunctions'
import path from 'path'
import { ARCHIVE_SUBFOLDER_NAME, SNAPSHOT_FOLDER } from '../../../constants'
import { convertSnapshotToNewStructure } from './helpers'
import { ArchiveStore } from '../ArchiveStore'

const routeUseSnapshot = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  const snapshotName = request.query.name

  if (!snapshotName) return reply.send({ success: false, message: 'Snapshot name missing' })

  const fullPath = path.join(SNAPSHOT_FOLDER, snapshotName)

  if (await fsx.pathExists(path.join(fullPath, 'files', ARCHIVE_SUBFOLDER_NAME, 'archive.json'))) {
    // This is an OLD structure snapshot, so we'll make a copy with "OLD_"
    // prefix and make a copy with the new structure before loading
    const oldSnapshotName = `OLD_${snapshotName}`
    const oldSnapshotPath = path.join(SNAPSHOT_FOLDER, oldSnapshotName)
    await fsx.copy(fullPath, oldSnapshotPath, { overwrite: true })
    await convertSnapshotToNewStructure(fullPath, await ArchiveStore.create())
  }

  try {
    reply.send(await useSnapshot({ snapshotName }))
  } catch (e) {
    console.error('Error loading snapshot:', e)
    reply.send({
      success: false,
      message: 'There was a problem loading this snapshot',
      error: errorMessage(e),
    })
  }
}

export default routeUseSnapshot
