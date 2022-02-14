import fastify, { FastifyPluginCallback, FastifyReply } from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyMultipart from 'fastify-multipart'
import fastifyCors from 'fastify-cors'
import path from 'path'
import { loadActionPlugins } from './components/pluginsConnect'
import {
  routeUserInfo,
  routeUserPermissions,
  routeLogin,
  routeLoginOrg,
  routeUpdateRowPolicies,
  routeCreateHash,
  routeVerification,
  routeGetPrefs,
  routecheckUnique,
} from './components/permissions'
import { routeOutcomes, routeOutcomesTable, routeOutcomesDetail } from './components/outcomes'
import { routeGeneratePDF } from './components/files/documentGenerate'
import {
  saveFiles,
  getFilePath,
  createFilesFolder,
  filesFolder,
} from './components/files/fileHandler'
import { getAppEntryPointDir, objectKeysToSnakeCase } from './components/utilityFunctions'
import { routeRunAction, routeGetApplicationData } from './components/actions/runAction'
import config from './config'
import lookupTableRoutes from './lookup-table/routes'
import snapshotRoutes from './components/snapshots/routes'
import { routeGetLanguageFile } from './components/localisation/routes'
import { routeTriggers } from './components/other/routeTriggers'
import { extractJWTfromHeader, getTokenData } from './components/permissions/loginHelpers'
import migrationScript from '../database/migration/migrationScript'
require('dotenv').config()

// Fastify server

const startServer = async () => {
  await migrationScript()
  await loadActionPlugins() // Connects to Database and listens for Triggers

  createFilesFolder()

  const server = fastify()

  // For serving static files from "Files" folder
  server.register(fastifyStatic, {
    root: path.join(getAppEntryPointDir(), filesFolder),
  })

  server.register(fastifyMultipart)

  server.register(fastifyCors, { origin: '*' }) // Allow all origin (TODO change in PROD)

  const api: FastifyPluginCallback = (server, _, done) => {
    // Here we parse JWT, and set it in request.auth, which is available for downstream routes
    server.addHook('preValidation', async (request: any, reply: FastifyReply) => {
      if (request.url.startsWith('/api/public')) return

      const token = extractJWTfromHeader(request)
      const { error, ...tokenData } = await getTokenData(token)

      request.auth = tokenData

      if (error) {
        reply.statusCode = 401
        return reply.send({ success: false, message: error })
      }
    })

    // Routes to work without authentication check, behind /public route
    server.register(
      (server, _, done) => {
        server.post('/login', routeLogin)
        server.get('/get-prefs', routeGetPrefs)
        server.get('/language/:code', routeGetLanguageFile)
        server.get('/verify', routeVerification)
        // File download endpoint (get by unique ID)
        server.get('/file', async function (request: any, reply: any) {
          const { uid, thumbnail } = request.query
          const { original_filename, file_path, thumbnail_path } = await getFilePath(
            uid,
            thumbnail === 'true'
          )
          // TO-DO Check for permission to access file
          try {
            // TO-DO: Rename file back to original for download
            return reply.sendFile(file_path ? file_path : thumbnail_path)
          } catch {
            return reply.send({ success: false, message: 'Unable to retrieve file' })
          }
        })
        done()
      },
      { prefix: '/public' }
    )

    // Route for admin tasks only
    server.register(
      (server, _, done) => {
        // Check isAdmin
        server.addHook('preValidation', async (request: any, reply: FastifyReply) => {
          if (!request.auth.isAdmin) {
            reply.statusCode = 401
            return reply.send({ sucess: false, message: 'Not admin user' })
          }
        })

        server.register(lookupTableRoutes, { prefix: '/lookup-table' })
        server.register(snapshotRoutes, { prefix: '/snapshot' })
        server.get('/updateRowPolicies', routeUpdateRowPolicies)
        server.post('/run-action', routeRunAction)
        server.get('/get-application-data', routeGetApplicationData)
        done()
      },
      { prefix: '/admin' }
    )

    server.get('/check-unique', routecheckUnique)
    server.get('/user-info', routeUserInfo)
    server.get('/user-permissions', routeUserPermissions)
    server.post('/login-org', routeLoginOrg)
    server.post('/create-hash', routeCreateHash)
    server.post('/generate-pdf', routeGeneratePDF)
    server.get('/outcomes', routeOutcomes)
    server.get('/outcomes/table/:tableName', routeOutcomesTable)
    server.get('/outcomes/table/:tableName/item/:id', routeOutcomesDetail)
    server.get('/check-triggers', routeTriggers)

    // File upload endpoint
    server.post('/upload', async function (request: any, reply) {
      const data = await request.files()
      const fileData = await saveFiles(data, objectKeysToSnakeCase(request.query))
      reply.send({ success: true, fileData })
    })
    done()
  }

  server.get('/', async (request, reply) => {
    console.log('Request made')
    return 'This is the response\n'
  })

  server.register(api, { prefix: '/api' })

  server.listen(config.RESTport, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(
      `\n-------------------------\n|                       |\n|    CONFORMA v${config.version}    |\n|                       |\n-------------------------\n`
    )
    console.log(`Server listening at ${address}`)
  })

  // Fastify TO DO:
  //  - Serve actual bundled React App
  //  - Authentication endpoint
  //  - Endpoint for file serving
  //  - etc...
}

startServer()
