import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import { commitTemplate } from './commitTemplate'
import { returnApiError } from './ApiError'
import { exportTemplateCheck } from './exportTemplate'

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
  request: FastifyRequest<{ Params: { id: string }; Body: { comment?: string } }>,
  reply: FastifyReply
) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeDuplicateTemplateNew = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeDuplicateTemplateVersion = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
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
