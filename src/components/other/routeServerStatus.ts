import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import databaseConnect from '../databaseConnect'
import config from '../../config'
import { Config } from '../../types'
import { SocketStream } from '@fastify/websocket'

const notifyClients = async (message: string, server: FastifyInstance) => {
  server.websocketServer.clients.forEach((client) => client.send(message))
}

export const updateMaintenanceModeInConfig = async (config: Config) => {
  const storedValue = await databaseConnect.getSystemInfo('maintenanceMode')
  config.maintenanceMode = storedValue?.enabled ?? false
}

export const routeSetMaintenanceMode = (
  request: FastifyRequest<{ Body: { enabled: boolean } }>,
  reply: FastifyReply,
  server: FastifyInstance
) => {
  const { enabled } = request.body
  if (typeof enabled !== 'boolean') {
    reply.send({ success: false, message: 'Invalid parameter' })
    return
  }

  if (enabled !== config.maintenanceMode) {
    config.maintenanceMode = enabled
    console.log(`System Maintenance Mode ${enabled ? 'ON' : 'OFF'}\n`)
    databaseConnect.setSystemInfo('maintenanceMode', { enabled })
    notifyClients(
      JSON.stringify({
        maintenanceMode: config.maintenanceMode,
        redirect: config.maintenanceSite ?? config.defaultUnderMaintenanceSite,
      }),
      server
    )
  }
  reply.send({ success: true, enabled })
}

export const routeServerStatusWebsocket = (connection: SocketStream, server: FastifyInstance) => {
  console.log(`New client connected, ${server.websocketServer.clients.size} current connections`)
  if (config.maintenanceMode)
    connection.socket.send(
      JSON.stringify({
        maintenanceMode: config.maintenanceMode,
        force: true,
        redirect: config.maintenanceSite ?? config.defaultUnderMaintenanceSite,
      })
    )

  const messageTimer = setInterval(() => {
    console.log('Sending message')
    connection.socket.send('Every 2 mins...')
  }, 120_000)

  const timerId = setInterval(() => {
    console.log('Pinging client')
    connection.socket.ping('WTF?')
  }, 45_000)

  connection.socket.on('close', () => {
    console.log(`Client disconnected, ${server.websocketServer.clients.size} connections remaining`)
    clearInterval(timerId)
    clearInterval(messageTimer)
  })
}
