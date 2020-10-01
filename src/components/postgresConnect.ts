import { processTrigger, executeAction } from './triggersAndActions'
import { actionLibrary } from './pluginsConnect'
import * as config from '../config.json'
import { Client, Pool, QueryResult } from 'pg'
import {
  ActionInTemplate,
  ActionQueue,
  ActionQueueExecutePayload,
  ActionQueueGetPayload,
  ActionQueuePayload,
  ActionPlugin,
  ActionPluginDeletePayload,
  ActionPluginPayload,
  File,
  FilePayload,
  FileGetPayload,
  ActionInTemplateGetPayload,
  TriggerQueueUpdatePayload,
} from '../types'

class PostgresDB {
  private static _instance: PostgresDB
  private pool: Pool

  constructor() {
    this.pool = new Pool(config.pg_database_connection)

    // the pool will emit an error on behalf of any idle pools
    // it contains if a backend error or network partition happens
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle pool', err)
      process.exit(-1)
    })

    this.startListener()
  }

  private startListener = async () => {
    const listener = new Client(config.pg_database_connection)
    listener.connect()
    listener.query('LISTEN trigger_notifications')
    listener.query('LISTEN action_notifications')
    listener.on('notification', ({ channel, payload }) => {
      if (!payload) {
        console.log(`Notification ${channel} received with no payload!`)
        return
      }
      switch (channel) {
        case 'trigger_notifications':
          processTrigger(JSON.parse(payload))
          break
        case 'action_notifications':
          executeAction(JSON.parse(payload), actionLibrary)
          break
      }
    })
  }

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public query = async (text: string, payload: any): Promise<QueryResult> => {
    const client = await this.pool.connect()
    try {
      return await client.query(text, payload)
    } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
    }
  }

  public addActionQueue = async (action: ActionQueuePayload) => {
    try {
      const result = await this.query(
        'INSERT into action_queue (trigger_event, action_code, parameters, status, time_queued) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
        Object.values(action)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public executeActionQueued = async (payload: ActionQueueExecutePayload) => {
    try {
      await this.query(
        'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3',
        Object.values(payload)
      )
    } catch (err) {
      return err.stack
    }
  }

  public getActionsQueued = async (
    payload: ActionQueueGetPayload = { status: 'Scheduled' }
  ): Promise<ActionQueue[]> => {
    try {
      const result = await this.query(
        'SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = $1 ORDER BY execution_time',
        Object.values(payload)
      )
      return result.rows as ActionQueue[]
    } catch (err) {
      return err.stack
    }
  }

  public addFile = async (payload: FilePayload): Promise<Pick<File, 'id'>> => {
    try {
      const result = await this.query(
        'INSERT INTO file (user_id, original_filename, path, mimetype, application_id, application_response_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        Object.values(payload)
      )
      return result.rows[0] as Pick<File, 'id'>
    } catch (err) {
      return err.stack
    }
  }

  public getFile = async (payload: FileGetPayload): Promise<File> => {
    try {
      const result = await this.query(
        'SELECT path, original_filename FROM file WHERE id = $1',
        payload
      )
      return result.rows[0] as File
    } catch (err) {
      return err.stack
    }
  }

  public addActionPlugin = async (plugin: ActionPluginPayload) => {
    const getValuesPlaceholders = (plugin: ActionPluginPayload) =>
      Object.keys(plugin).map((key, index) => `$${index + 1}`)

    console.log('addAction:', `(${Object.keys(plugin)})`, `(${getValuesPlaceholders(plugin)})`)

    try {
      await this.query(
        `INSERT INTO action_plugin (${Object.keys(plugin)}) VALUES (${getValuesPlaceholders(
          plugin
        )})`,
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public deleteActionPlugin = async (payload: ActionPluginDeletePayload) => {
    try {
      await this.query('DELETE FROM action_plugin WHERE code = $1', Object.values(payload))
    } catch (err) {
      console.log(err.stack)
    }
  }

  public getActionPlugins = async (): Promise<ActionPlugin[]> => {
    try {
      const result = await this.query('SELECT * FROM action_plugin', [])
      return result.rows as ActionPlugin[]
    } catch (err) {
      return err.stack
    }
  }

  public getActionPluginsByTemplate = async (
    tableName: string,
    payload: ActionInTemplateGetPayload
  ): Promise<ActionInTemplate[]> => {
    try {
      const result = await this.query(
        `SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries 
          FROM template 
         JOIN template_action ON template.id = template_action.template_id 
         JOIN action_plugin ON template_action.action_code = action_plugin.code 
         WHERE template_id = (SELECT template_id FROM ${tableName} WHERE id = $1) AND trigger = $2`,
        Object.values(payload)
      )

      return result.rows as ActionInTemplate[]
    } catch (err) {
      return err.stack
    }
  }

  public updateActionPlugin = async (plugin: ActionPluginPayload) => {
    try {
      await this.query(
        'UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6',
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public updateTriggerQueue = async (payload: TriggerQueueUpdatePayload) => {
    try {
      await this.query('UPDATE trigger_queue SET status = $1 WHERE id = $2', payload)
    } catch (err) {
      console.log(err.stack)
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
