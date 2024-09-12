import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'

export const templateRoutes: FastifyPluginCallback<{ prefix: string }> = (server, _, done) => {
  server.get('/export/check/:id', routeExportTemplateCheck)
  server.get('/export/dump/:id', routeExportTemplateDump)
  server.post('/import/upload', routeImportTemplateUpload)
  server.post('/import/install/:uid', routeImportTemplateInstall)
  server.get('/get-links/:id', routeGetTemplateLinks)
  server.get('/get-suggested-links/:id', routeGetTemplateSuggestedLinks)
  server.get('/get-entities', routeLinkEntities)

  done()
}

const routeExportTemplateCheck = async (request: FastifyRequest, reply: FastifyReply) => {
  //   const isArchive = (request.query as Query).archive === 'true'
  //   const snapshotName = (request.query as Query).name

  reply.send('DONE')
}

const routeExportTemplateDump = async (request: FastifyRequest, reply: FastifyReply) => {
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
