import { FastifyPluginCallback } from 'fastify'
import routeListSnapshots from './routeListSnapshots'
import routeTakeSnapshot from './routeTakeSnapshot'
import routeUseSnapshot from './routeUseSnapshot'
import routeUploadSnapshot from './routeUploadSnapshot'
import routeDeleteSnapshot from './routeDeleteSnapshot'
import routeDownloadSnapshot from './routeDownloadSnapshot'
import routeFetchArchives from './routeFetchArchives'
import routePurgeOrphanArchives from './routePurgeOrphanArchives'
import routeStoreArchives from './routeStoreArchives'

const snapshotRoutes: FastifyPluginCallback<{ prefix: string }> = (server, _, done) => {
  server.get('/list', routeListSnapshots)
  server.get('/fetch-archives', routeFetchArchives)
  server.post('/take', routeTakeSnapshot)
  server.post('/use', routeUseSnapshot)
  server.post('/upload', routeUploadSnapshot)
  server.post('/delete', routeDeleteSnapshot)
  server.post('/download', routeDownloadSnapshot)
  server.post('/purge-orphan-archives', routePurgeOrphanArchives)
  server.post('/store-archives', routeStoreArchives)

  done()
}

export default snapshotRoutes
