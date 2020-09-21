import {
  loadActions,
  loadScheduledActions,
  processTrigger,
  executeAction,
} from './triggersAndActions'
import { ActionLibrary, DatabaseRecord } from '../types'
import registerPlugins from './registerPlugins'
import * as config from '../config.json'

const { Client } = require('pg')

// Postgres Database listeners for Triggers/Actions
export const pgClient = new Client(config.pg_database_connection)

pgClient.connect()
console.log('Connecting to Postgres...')

// Load action plugins
const actionLibrary: ActionLibrary = {}
const actionSchedule: any[] = []

export const loadActionPlugins = async () => {
  // Scan plugins folder and update Database
  await registerPlugins(pgClient)
  // Load Action functions into global scope
  await loadActions(pgClient, actionLibrary)
  // Schedule future actions and execute overdue ones
  await loadScheduledActions(pgClient, actionLibrary, actionSchedule)
}

pgClient.on('notification', (msg: DatabaseRecord) => {
  switch (msg.channel) {
    case 'trigger_notifications':
      processTrigger(pgClient, JSON.parse(msg.payload))
      break
    case 'action_notifications':
      executeAction(pgClient, JSON.parse(msg.payload), actionLibrary)
      break
  }
})

pgClient.query('LISTEN trigger_notifications')
pgClient.query('LISTEN action_notifications')
