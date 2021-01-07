import fastify from 'fastify'
import fastifyStatic from 'fastify-static'
import fastifyMultipart from 'fastify-multipart'
import fastifyCors from 'fastify-cors'
import path from 'path'
import { loadActionPlugins } from './components/pluginsConnect'
import { routeUserPermissions, routeLogin, routeUpdateRowPolicies } from './components/permissions'
import {
  saveFiles,
  getFilename,
  createFilesFolder,
  filesFolderName,
} from './components/fileHandler'
import { getAppRootDir } from './components/utilityFunctions'
import DBConnect from './components/databaseConnect'
// import PostgresDB from './components/postgresConnect'

// Bare-bones Fastify server

const startServer = async () => {
  await loadActionPlugins() // Connects to Database and listens for Triggers

  createFilesFolder()

  const server = fastify()

  server.register(fastifyStatic, {
    root: path.join(getAppRootDir(), filesFolderName),
  })

  server.register(fastifyMultipart)

  server.register(fastifyCors, { origin: '*' }) // Allow all origin (TODO change in PROD)

  // File download endpoint (get by Database ID)
  server.get('/file', async function (request: any, reply: any) {
    const filename = await getFilename(request.query.id)
    // TO-DO Check for permission to access file
    return reply.sendFile(filename)
  })

  server.get('/userInfo', routeUserPermissions)
  server.post('/login', routeLogin)
  server.get('/updateRowPolicies', routeUpdateRowPolicies)

  // File upload endpoint
  server.post('/upload', async function (request: any, reply) {
    // TO-DO: Check if logged in
    const data = await request.files()
    await saveFiles(data, request.query)
    reply.send()
  })

  server.get('/', async (request, reply) => {
    console.log('Request made')
    return 'This is the response\n'
  })

  // Unique name/email/organisation check
  server.get('/check-unique', async (request: any, reply) => {
    const { type, value } = request.query
    if (value === '' || value === undefined) {
      reply.send({
        unique: false,
        message: 'Value not provided',
      })
      return
    }
    let table, field
    switch (type) {
      case 'username':
        table = 'user'
        field = 'username'
        break
      case 'email':
        table = 'user'
        field = 'email'
        break
      case 'organisation':
        table = 'organisation'
        field = 'name'
        break
      default:
        reply.send({
          unique: false,
          message: 'Type missing or invalid',
        })
        return
    }
    try {
      const isUnique = await DBConnect.isUnique(table, field, value)
      reply.send({
        unique: isUnique,
        message: '',
      })
    } catch (err) {
      reply.send({ unique: false, message: err.message })
    }
  })

  server.listen(8080, (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })

  // Fastify TO DO:
  //  - Serve actual bundled React App
  //  - Authentication endpoint
  //  - Endpoint for file serving
  //  - etc...
}

startServer()

// Just for testing
// setTimeout(() => console.log(actionLibrary, actionSchedule), 3000);
