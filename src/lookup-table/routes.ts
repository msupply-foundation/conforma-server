import { ImportCsvController } from './controllers'

const lookupTableRoutes = (server: any, opts: any, done: any) => {
  server.post('/import', ImportCsvController)
  done()
}

export default lookupTableRoutes
