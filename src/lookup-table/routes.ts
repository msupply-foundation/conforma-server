import { ImportCsvController, ImportCsvUpdateController } from './controllers'

const lookupTableRoutes = (server: any, opts: any, done: any) => {
  server.post('/import', ImportCsvController)
  server.post('/import/:lookupTableId', ImportCsvUpdateController)
  done()
}

export default lookupTableRoutes
