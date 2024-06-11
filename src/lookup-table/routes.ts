import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify'
import { ImportCsvController, ImportCsvUpdateController } from './controllers'
import db from './databaseMethods'
import config from '../config'
import { routeExportLookupTable } from './export'
import { errorMessage } from '../components/utilityFunctions'

const lookupTableRoutes: FastifyPluginCallback<{ prefix: string }> = (server, _, done) => {
  server.addHook('preValidation', async (request: any, reply: FastifyReply) => {
    const { managerCanEditLookupTables = true } = config
    const { isAdmin = false, isManager = false } = request.auth

    if (managerCanEditLookupTables) {
      if (!(isAdmin || isManager)) {
        reply.statusCode = 401
        return reply.send({ success: false, message: 'Unauthorized: not admin or manager' })
      }
    }

    if (!managerCanEditLookupTables && !isAdmin) {
      reply.statusCode = 401
      return reply.send({ success: false, message: 'Unauthorized: not admin' })
    }
  })
  server.get('/list', async (req: FastifyRequest, reply: FastifyReply) => {
    try {
      const list = await db.listLookupTables()
      return reply.send(list)
    } catch (err) {
      reply.status(500)
      return reply.send(errorMessage(err))
    }
  })
  server.post('/import', ImportCsvController)
  server.get('/export/:id', routeExportLookupTable)
  server.post('/import/:lookupTableId', ImportCsvUpdateController)
  done()
}

export default lookupTableRoutes
