import fastify, { FastifyPluginCallback, FastifyReply } from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyMultipart from 'fastify-multipart'
import fastifyCors from 'fastify-cors'
import { DateTime, Settings } from 'luxon'
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
  routeCheckUnique,
} from './components/permissions'
import { routeGetPrefs, routeGetAllPrefs, routeSetPrefs } from './components/preferences'
import {
  routeDataViews,
  routeDataViewTable,
  routeDataViewDetail,
  routeDataViewFilterList,
  routeGenerateFilterDataFields,
} from './components/data_display'
import { routeGeneratePDF } from './components/files/documentGenerate'
import { saveFiles, getFilePath, filesFolder } from './components/files/fileHandler'
import { createDefaultDataFolders } from './components/files/createDefaultFolders'
import { getAppEntryPointDir, objectKeysToSnakeCase } from './components/utilityFunctions'
import {
  routeRunAction,
  routeGetApplicationData,
  routePreviewActions,
  routeExtendApplication,
  routeTestTrigger,
} from './components/actions'
import cleanUpFiles from './components/files/cleanup'
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
import routeArchiveFiles from './components/files/routeArchiveFiles'
import { Schedulers } from './components/scheduler'
import { routeAccessExternalApi } from './components/external-apis/routes'
require('dotenv').config()

// Set the default locale and timezone for date-time display (in console)
Settings.defaultLocale = config.locale ?? Intl.DateTimeFormat().resolvedOptions().locale
if (config.timezone) Settings.defaultZoneName = config.timezone

// Don't start server if env variables not provided
const web_host = process.env.WEB_HOST
if (!web_host) {
  console.error(
    "ERROR!\nUnable to find the WEB_URL environment variable (maybe others too). The server won't start without access without it.\n\nExiting now...\n"
  )
  process.exit(1)
}

// Fastify server
const startServer = async () => {
  await migrateData()
  await loadActionPlugins() // Connects to Database and listens for Triggers
  createDefaultDataFolders()
  await cleanUpFiles() // Runs on schedule as well as startup

  // Add schedulers to global "config" object so we can update them. There should
  // only be a single global instance of Schedulers -- this one!
  config.scheduledJobs = new Schedulers()

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
          const { uid, thumbnail = false } = request.query
          const { originalFilename, filePath, thumbnailPath } = await getFilePath(uid, thumbnail)
          // TO-DO Check for permission to access file
          try {
            // TO-DO: Rename file back to original for download
            return reply.sendFile(thumbnail ? thumbnailPath : filePath)
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

        server.register(snapshotRoutes, { prefix: '/snapshot' })
        server.get('/updateRowPolicies', routeUpdateRowPolicies)
        server.get('/get-application-data', routeGetApplicationData)
        server.post('/enable-language', routeEnableLanguage)
        server.post('/install-language', routeInstallLanguage)
        server.post('/remove-language', routeRemoveLanguage)
        server.get('/all-languages', routeGetAllLanguageFiles)
        server.get('/get-all-prefs', routeGetAllPrefs)
        server.post('/set-prefs', routeSetPrefs)
        server.get('/archive-files', routeArchiveFiles)
        // Dev only actions -- never call from app
        server.post('/run-action', routeRunAction)
        server.post('/test-trigger', routeTestTrigger)
        server.post('/generate-filter-data-fields', routeGenerateFilterDataFields)
        done()
      },
      { prefix: '/admin' }
    )

    // Routes that require authentication but no special permissions
    server.get('/check-unique', routeCheckUnique)
    server.get('/user-info', routeUserInfo)
    server.get('/user-permissions', routeUserPermissions)
    server.post('/login-org', routeLoginOrg)
    server.post('/create-hash', routeCreateHash)
    server.post('/generate-pdf', routeGeneratePDF)
    server.get('/data-views', routeDataViews)
    server.post('/data-views/:dataViewCode', routeDataViewTable)
    server.get('/data-views/:dataViewCode/:id', routeDataViewDetail)
    server.post('/data-views/:dataViewCode/filterList/:column', routeDataViewFilterList)
    server.get('/check-triggers', routeTriggers)
    server.post('/preview-actions', routePreviewActions)
    server.post('/extend-application', routeExtendApplication)
    server.post('/external-api/:name/:route', routeAccessExternalApi)
    // Lookup tables requires "systemManager" permission
    server.register(lookupTableRoutes, { prefix: '/lookup-table' })

    // File upload endpoint
    server.post('/upload', async function (request: any, reply) {
      const data = await request.files()
      const fileData = await saveFiles(data, objectKeysToSnakeCase(request.query))
      reply.send({ success: true, fileData })
    })
    done()
  }

  server.get('/', async () => {
    console.log('API Request received')
    return `Welcome to CONFORMA\n${DateTime.now().toLocaleString(
      DateTime.DATETIME_HUGE_WITH_SECONDS
    )}`
  })

  server.register(api, { prefix: '/api' })

  server.listen(config.RESTport, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(generateAsciiHeader(config.version))
    console.log(DateTime.now().toLocaleString(DateTime.DATETIME_HUGE_WITH_SECONDS))
    console.log('Locale:', Settings.defaultLocale)
    console.log('Timezone:', Settings.defaultZoneName)
    console.log('Email mode:', config.emailMode)
    if (config.emailMode === 'TEST') console.log('All email will be sent to:', config.testingEmail)
    console.log(`\nServer listening at ${address}`)
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
