import { FastifyPluginCallback } from 'fastify'
import { ImportCsvController, ImportCsvUpdateController } from './controllers'

const lookupTableRoutes: FastifyPluginCallback<{ prefix: string }> = (server, opts, done) => {
  server.post('/import', ImportCsvController)
  server.post('/import/:lookupTableId', ImportCsvUpdateController)
  done()
}

export default lookupTableRoutes
