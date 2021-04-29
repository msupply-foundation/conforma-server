import { FastifyPluginCallback } from 'fastify'
import { ImportCsvController, ImportCsvUpdateController, ExportCsvController } from './controllers'

const lookupTableRoutes: FastifyPluginCallback<{ prefix: string }> = (server, opts, done) => {
  server.post('/import', ImportCsvController)
  server.get('/export/:lookupTableId', ExportCsvController)
  server.post('/import/:lookupTableId', ImportCsvUpdateController)
  done()
}

export default lookupTableRoutes
