import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fsx from 'fs-extra'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { ApiError } from '../../ApiError'
import {
  exportTemplate,
  duplicateTemplate,
  checkTemplate,
  commitTemplate,
  getDataViewDetails,
  getLinkedFiles,
  getSingleEntityDiff,
  importTemplateInstall,
  importTemplateUpload,
  PreserveExistingEntities,
  getFragmentDetails,
} from './operations'
import path from 'path'
import { FILES_FOLDER, FILES_TEMP_FOLDER } from '../../constants'
import { stageFileForDownload } from '../stagedDownloads'
import StreamZip from 'node-stream-zip'
import { customAlphabet } from 'nanoid'
import { CombinedLinkedEntities } from './types'
import config from '../../config'

const pump = promisify(pipeline)

/** All the routes for template management */

export const templateRoutes: FastifyPluginCallback<{ prefix: string }> = (server, _, done) => {
  server.post('/commit/:id', routeCommitTemplate)
  server.post('/duplicate/new/:id', routeDuplicateTemplateNew)
  server.post('/duplicate/version/:id', routeDuplicateTemplateVersion)
  server.post('/prepare-export/:id', routeTemplatePrepareExport)
  server.get('/check/:id', routeTemplateCheck)
  server.post('/import/upload', routeImportTemplateUpload)
  server.get('/import/get-full-entity-diff/:uid', routeImportGetDiff)
  server.post('/import/install/:uid', routeImportTemplateInstall)
  server.get('/get-data-view-details/:id', routeGetDataViewDetails)
  server.get('/get-fragment-details/:id', routeGetFragmentDetails)
  server.get('/get-linked-files/:id', routeGetLinkedFiles)
  done()
}

const routeCommitTemplate = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { comment?: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const comment = request.body?.comment ?? null
  const result = await commitTemplate(templateId, comment)
  return reply.send(result)
}

const routeTemplateCheck = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const result = await checkTemplate(templateId)
  return reply.send(result)
}

const routeTemplatePrepareExport = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const filename = await exportTemplate(templateId)
  const { url } = await stageFileForDownload(path.join(FILES_FOLDER, filename), filename, {
    consumeSource: true,
  })
  return reply.send({ url, filename })
}

const routeDuplicateTemplateNew = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { code: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const code = request.body?.code
  if (!code) throw new ApiError('New template code missing', 400)

  const result = await duplicateTemplate(templateId, code)
  return reply.send(result)
}

const routeDuplicateTemplateVersion = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { code: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const result = await duplicateTemplate(templateId)
  return reply.send(result)
}

const routeImportTemplateUpload = async (request: FastifyRequest, reply: FastifyReply) => {
  let upload
  try {
    // @ts-ignore
    upload = await request.file()
  } catch (err) {
    throw new ApiError('No file attached', 400)
  }

  if (!upload) throw new ApiError('No file attached', 400)

  if (upload.mimetype !== 'application/zip') throw new ApiError('File is not a ZIP file', 400)

  const tempZipLocation = path.join(FILES_TEMP_FOLDER, 'templateUpload.zip')
  await fsx.ensureDir(FILES_TEMP_FOLDER)
  await pump(upload.file, fsx.createWriteStream(tempZipLocation))

  const folderName = getRandomTemplateFolderName()
  const unzippedTemplatePath = path.join(FILES_TEMP_FOLDER, folderName)

  try {
    const zip = new StreamZip.async({ file: tempZipLocation })
    await fsx.ensureDir(unzippedTemplatePath)
    await zip.extract(null, unzippedTemplatePath)
    await zip.close()
    await fsx.remove(tempZipLocation)
  } catch (err) {
    throw new ApiError(`Problem unzipping uploaded file: ${(err as Error).message}`, 400)
  }

  const modifiedEntities = await importTemplateUpload(folderName)
  const ready =
    Object.values(modifiedEntities)
      .map((ob) => Object.values(ob))
      .flat().length === 0

  // Cleanup temp upload if not installed within next 10 mins
  config.scheduledJobs?.manuallySchedule('fileCleanup', 10)

  return reply.send({ uid: folderName, modifiedEntities, ready })
}

const routeImportGetDiff = async (
  request: FastifyRequest<{
    Params: { uid: string }
    Querystring: { type: keyof CombinedLinkedEntities; value: string }
  }>,
  reply: FastifyReply
) => {
  const uid = request.params.uid
  if (!uid) throw new ApiError('No UID specified for imported template', 400)

  const { type, value } = request.query
  const result = await getSingleEntityDiff(uid, type, value)
  return reply.send(result)
}

const routeImportTemplateInstall = async (
  request: FastifyRequest<{
    Params: { uid: string }
    Body: { [K in keyof PreserveExistingEntities]: string[] } & { category: string }
  }>,
  reply: FastifyReply
) => {
  const uid = request.params.uid
  if (!uid) throw new ApiError('No UID specified for template install', 400)

  const preserveExistingEntities = request.body ?? {}

  const preserveExistingEntitySets = Object.fromEntries(
    Object.entries(preserveExistingEntities)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [key, key === 'category' ? value : new Set(value)])
  )

  const result = await importTemplateInstall(uid, preserveExistingEntitySets)
  return reply.send(result)
}

const routeGetDataViewDetails = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const dataViews = await getDataViewDetails(templateId)
  return reply.send(dataViews)
}

const routeGetFragmentDetails = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const fragments = await getFragmentDetails(templateId)
  return reply.send(fragments)
}

const routeGetLinkedFiles = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId) throw new ApiError('Invalid template id', 400)

  const files = await getLinkedFiles(templateId)
  return reply.send(files)
}

const getRandomTemplateFolderName = customAlphabet('abcdefghijklmnopqrstuvwxyz1234567890', 24)
