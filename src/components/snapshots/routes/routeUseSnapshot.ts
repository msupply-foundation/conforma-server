import { FastifyRequest, FastifyReply } from 'fastify'
import fsx from 'fs-extra'
import useSnapshot from '../useSnapshot'
import { errorMessage } from '../../utilityFunctions'
import path from 'path'
import { ARCHIVE_SUBFOLDER_NAME, SNAPSHOT_FOLDER } from '../../../constants'
import { convertSnapshotToNewStructure } from './helpers'

const routeUseSnapshot = async (
  request: FastifyRequest<{ Querystring: { name?: string } }>,
  reply: FastifyReply
) => {
  const requestedName = request.query.name

  if (!requestedName) return reply.send({ success: false, message: 'Snapshot name missing' })

  const requestedPath = path.join(SNAPSHOT_FOLDER, requestedName)
  let nameToLoad = requestedName

  if (
    await fsx.pathExists(path.join(requestedPath, 'files', ARCHIVE_SUBFOLDER_NAME, 'archive.json'))
  ) {
    if (requestedName.startsWith('OLD_')) {
      // Loading an already-prefixed OLD_ legacy snapshot: convert into a
      // sibling without the OLD_ prefix instead of stacking another OLD_ on
      // top. The original OLD_ folder stays as the intact legacy copy.
      const targetName = requestedName.replace(/^OLD_/, '')
      const targetPath = path.join(SNAPSHOT_FOLDER, targetName)
      if (await fsx.pathExists(targetPath)) {
        return reply.send({
          success: false,
          message: 'There was a problem loading this snapshot',
          error: `Snapshot already exists: ${targetName}`,
        })
      }
      await fsx.copy(requestedPath, targetPath)
      await convertSnapshotToNewStructure(targetPath)
      nameToLoad = targetName
    } else {
      // Standard case: back the legacy snapshot up to OLD_<name>, then
      // convert the original in place. Don't overwrite an existing OLD_ copy
      // — if a previous conversion was interrupted, that copy may be the
      // only intact version of the legacy snapshot.
      const oldSnapshotPath = path.join(SNAPSHOT_FOLDER, `OLD_${requestedName}`)
      await fsx.copy(requestedPath, oldSnapshotPath, { overwrite: false, errorOnExist: false })
      await convertSnapshotToNewStructure(requestedPath)
    }
  }

  try {
    reply.send(await useSnapshot({ snapshotName: nameToLoad }))
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
