import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import fsx from 'fs-extra'
import { commitTemplate } from './commitTemplate'
import { returnApiError } from './ApiError'
import { exportTemplateCheck, exportTemplateDump } from './exportTemplate'
import { FILES_FOLDER } from '../../constants'
import path from 'path'
import { duplicateTemplate } from './duplicateTemplate'

export const templateRoutes: FastifyPluginCallback<{ prefix: string }> = (server, _, done) => {
  server.post('/commit/:id', routeCommitTemplate)
  server.post('/duplicate/new/:id', routeDuplicateTemplateNew)
  server.post('/duplicate/version/:id', routeDuplicateTemplateVersion)
  server.get('/export/check/:id', routeExportTemplateCheck)
  server.get('/export/dump/:id', routeExportTemplateDump)
  server.post('/import/upload', routeImportTemplateUpload)
  server.post('/import/install/:uid', routeImportTemplateInstall)
  server.get('/get-links/:id', routeGetTemplateLinks)
  server.get('/get-suggested-links/:id', routeGetTemplateSuggestedLinks)
  server.get('/get-entities', routeGetAllEntities)
  server.post('/link-entities', routeLinkEntities)

  done()
}

const routeCommitTemplate = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { comment?: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId || isNaN(templateId)) {
    returnApiError('Invalid template id', reply, 400)
  }
  const comment = request.body?.comment ?? null

  try {
    const result = await commitTemplate(templateId, comment)
    return reply.send(result)
  } catch (err) {
    returnApiError(err, reply)
  }
}

const routeExportTemplateCheck = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId || isNaN(templateId)) {
    returnApiError('Invalid template id', reply, 400)
  }

  try {
    const result = await exportTemplateCheck(templateId)
    return reply.send(result)
  } catch (err) {
    returnApiError(err, reply)
  }
}

const routeExportTemplateDump = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId || isNaN(templateId)) {
    returnApiError('Invalid template id', reply, 400)
  }

  try {
    const filepath = await exportTemplateDump(templateId)
    reply.sendFile(filepath)
    // fsx.remove(path.join(FILES_FOLDER, filepath))
    return reply
  } catch (err) {
    returnApiError(err, reply)
  }
}

const routeDuplicateTemplateNew = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { code: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId || isNaN(templateId)) {
    returnApiError('Invalid template id', reply, 400)
  }

  const code = request.body?.code
  if (!code) {
    returnApiError('New template code missing', reply, 400)
  }

  try {
    const result = await duplicateTemplate(templateId, code)
    return reply.send(result)
  } catch (err) {
    returnApiError(err, reply)
  }
}

const routeDuplicateTemplateVersion = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { code: string } }>,
  reply: FastifyReply
) => {
  const templateId = Number(request.params.id)
  if (!templateId || isNaN(templateId)) {
    returnApiError('Invalid template id', reply, 400)
  }

  try {
    const result = await duplicateTemplate(templateId)
    return reply.send(result)
  } catch (err) {
    returnApiError(err, reply)
  }
}

const routeImportTemplateUpload = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeImportTemplateInstall = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeGetTemplateLinks = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeGetTemplateSuggestedLinks = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeGetAllEntities = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeLinkEntities = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}
