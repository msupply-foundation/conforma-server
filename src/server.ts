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
import { routeDataViews, routeDataViewTable, routeDataViewDetail } from './components/data_display'
import { routeGeneratePDF } from './components/files/documentGenerate'
import { saveFiles, getFilePath, filesFolder } from './components/files/fileHandler'
import { createDefaultDataFolders } from './components/files/createDefaultFolders'
import { getAppEntryPointDir, objectKeysToSnakeCase } from './components/utilityFunctions'
import {
  routeRunAction,
  routeGetApplicationData,
  routePreviewActions,
  routeExtendApplication,
  cleanUpPreviewFiles,
} from './components/actions'
import config from './config'
import lookupTableRoutes from './lookup-table/routes'
import snapshotRoutes from './components/snapshots/routes'
import {
  routeGetLanguageFile,
  routeEnableLanguage,
  routeInstallLanguage,
  routeRemoveLanguage,
  routeGetAllLanguageFiles,
} from './components/localisation/routes'
import { routeTriggers } from './components/other/routeTriggers'
import { extractJWTfromHeader, getTokenData } from './components/permissions/loginHelpers'
import migrateData from '../database/migration/migrateData'
require('dotenv').config()

// Fastify server

const startServer = async () => {
  await migrateData()
  await loadActionPlugins() // Connects to Database and listens for Triggers
  await cleanUpPreviewFiles() // Runs on schedule as well as startup

  createDefaultDataFolders()

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
        server.post('/enable-language', routeEnableLanguage)
        server.post('/install-language', routeInstallLanguage)
        server.post('/remove-language', routeRemoveLanguage)
        server.get('/all-languages', routeGetAllLanguageFiles)
        done()
      },
      { prefix: '/admin' }
    )

    // Routes that require authentication but no special permissions
    server.get('/check-unique', routecheckUnique)
    server.get('/user-info', routeUserInfo)
    server.get('/user-permissions', routeUserPermissions)
    server.post('/login-org', routeLoginOrg)
    server.post('/create-hash', routeCreateHash)
    server.post('/generate-pdf', routeGeneratePDF)
    server.get('/data-views', routeDataViews)
    server.get('/data-views/:dataViewCode', routeDataViewTable)
    server.get('/data-views/:dataViewCode/:id', routeDataViewDetail)
    server.get('/check-triggers', routeTriggers)
    server.post('/preview-actions', routePreviewActions)
    server.post('/extend-application', routeExtendApplication)

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
    console.log(generateAsciiHeader(config.version))
    console.log(`Server listening at ${address}`)
  })

  // Fastify TO DO:
  //  - Serve actual bundled React App
  //  - Authentication endpoint
  //  - Endpoint for file serving
  //  - etc...
}

startServer()

function generateAsciiHeader(version: string) {
  // Should look like:
  // -------------------------
  // |                       |
  // |    CONFORMA v0.2.1    |
  // |                       |
  // -------------------------
  const name = `CONFORMA v${version}`
  const pad = name.length % 2 === 0 ? 0 : 1
  const outerLine = '-'.repeat(28 + pad)
  const innerLine = '|' + ' '.repeat(26 + pad) + '|'
  const nameGap = ' '.repeat((27 + pad) / 2 - (name.length + pad) / 2)
  const nameLine = `|${nameGap}${name}${nameGap}|`
  return `\n${outerLine}\n${innerLine}\n${nameLine}\n${innerLine}\n${outerLine}\n`
}
