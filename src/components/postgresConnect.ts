import {
  DatabaseRecord,
  loadActions,
  loadScheduledActions,
  processTrigger,
  executeAction,
} from './triggersAndActions';
import registerPlugins from './registerPlugins';

const { Client } = require('pg');

// Postgres Database listeners for Triggers/Actions
export const pgClient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'tmf_app_manager',
  password: '',
  port: 5432,
});

pgClient.connect();
console.log('Connecting to Postgres...');

// Load action plugins
const actionLibrary: { [key: string]: Function } = {};
const actionSchedule: any[] = [];

export const loadActionPlugins = async () => {
  // Scan plugins folder and update Database
  await registerPlugins(pgClient);
  // Load Action functions into global scope
  await loadActions(pgClient, actionLibrary);
  // Schedule future actions and execute overdue ones
  await loadScheduledActions(pgClient, actionLibrary, actionSchedule);
};

pgClient.on('notification', (msg: DatabaseRecord) => {
  switch (msg.channel) {
    case 'trigger_notifications':
      processTrigger(pgClient, JSON.parse(msg.payload));
      break;
    case 'action_notifications':
      executeAction(pgClient, JSON.parse(msg.payload), actionLibrary);
      break;
  }
  // console.log(msg.payload);
});

pgClient.query('LISTEN trigger_notifications');
pgClient.query('LISTEN action_notifications');
