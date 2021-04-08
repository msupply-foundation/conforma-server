import { ImportCsvController, ImportCsvUpdateController, ExportCsvController } from './controllers'

const lookupTableRoutes = (server: any, opts: any, done: any) => {
  server.post('/import', ImportCsvController)
  server.get('/export/:lookupTableId', ExportCsvController)
  server.post('/import/:lookupTableId', ImportCsvUpdateController)
  done()
}

export default lookupTableRoutes
