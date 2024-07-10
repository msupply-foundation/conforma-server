// An endpoint for providing lists of files, but only ones the user should have
// permission to access. Namely:
// - files associated with an application user has permission to view
// - files marked "external_reference_doc" can be accessed by anyone
// - files marked "internal_reference_doc" can be accessed by internal users
//
// The actual files themselves can still be accessed by anyone who has the
// correct file ID via the public /file endpoint

import DBConnect from '../databaseConnect'
import { File } from '../../generated/graphql'
import { FastifyReply, FastifyRequest } from 'fastify'
import { getUserInfo } from '../permissions/loginHelpers'

type FileData = Pick<
  File,
  | 'uniqueId'
  | 'description'
  | 'filePath'
  | 'originalFilename'
  | 'thumbnailPath'
  | 'timestamp'
  | 'isExternalReferenceDoc'
  | 'isInternalReferenceDoc'
  | 'isOutputDoc'
>

export type FilesRequest = {
  Querystring: { applicationId?: string; outputOnly?: 'true'; external?: 'true'; internal?: 'true' }
}

export const routeFileLists = async (
  request: FastifyRequest<FilesRequest>,
  reply: FastifyReply
) => {
  let files: Set<FileData> = new Set()

  const { applicationId, outputOnly, external, internal } = request.query

  if (!isNaN(Number(applicationId))) {
    const userAuth = request?.headers?.authorization ?? ''
    const allFiles: File[] = await DBConnect.getApplicationFiles(Number(applicationId), userAuth)
    if (outputOnly === 'true') {
      files = new Set(allFiles.filter((file) => file.isOutputDoc))
    } else files = new Set(allFiles)
  }

  if (external === 'true' || internal === 'true') {
    const refDocs: File[] = await DBConnect.getReferenceDocs()
    if (external === 'true')
      files = new Set([...files, ...refDocs.filter((file) => file.isExternalReferenceDoc)])

    if (internal === 'true') {
      const { userId, orgId } = (
        request as FastifyRequest & { auth: { userId: number; orgId: number } }
      ).auth
      const userInfo = await getUserInfo({ userId, orgId })
      if (userInfo.user.organisation?.isSystemOrg)
        files = new Set([...files, ...refDocs.filter((file) => file.isInternalReferenceDoc)])
    }
  }

  return reply.send(Array.from(files))
}
