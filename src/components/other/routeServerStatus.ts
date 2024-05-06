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
  config.maintenanceMode = storedValue.enabled
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
  connection.socket.send(
    JSON.stringify({
      maintenanceMode: config.maintenanceMode,
      redirect: config.maintenanceSite ?? config.defaultUnderMaintenanceSite,
    })
  )

  connection.socket.on('close', () => {
    console.log(`Client disconnected, ${server.websocketServer.clients.size} connections remaining`)
  })
}
