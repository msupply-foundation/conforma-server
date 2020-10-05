import { processTrigger, executeAction } from './triggersAndActions'
import { actionLibrary } from './pluginsConnect'
import * as config from '../config.json'
import { Client, Pool, QueryResult } from 'pg'
import {
  ActionInTemplate,
  ActionQueue,
  ActionPlugin,
  File,
  ActionInTemplateGetPayload,
  ActionQueueExecutePayload,
  ActionQueueGetPayload,
  ActionQueuePayload,
  FilePayload,
  FileGetPayload,
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

  private getValuesPlaceholders = (object: { [key: string]: any }) =>
    Object.keys(object).map((key, index) => `$${index + 1}`)

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public query = async (text: string, payload: any[] = []): Promise<QueryResult> => {
    const client = await this.pool.connect()
    try {
      return await client.query(text, payload)
    } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
    }
  }

  public addActionQueue = async (action: ActionQueuePayload): Promise<boolean> => {
    const text = `INSERT into action_queue (${Object.keys(action)}, time_queued) 
      VALUES (${this.getValuesPlaceholders(action)}, CURRENT_TIMESTAMP)`

    try {
      await this.query(text, Object.values(action))
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }

  public executedActionStatusUpdate = async (
    payload: ActionQueueExecutePayload
  ): Promise<boolean> => {
    try {
      await this.query(
        'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3',
        Object.values(payload)
      )
      return true
    } catch (err) {
      console.log(err.stack)
      return false
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
      console.log(err.stack)
      return []
    }
  }

  public addFile = async (payload: FilePayload): Promise<number> => {
    const text = `INSERT INTO file (${Object.keys(payload)}) 
      VALUES (${this.getValuesPlaceholders(payload)}) RETURNING id`

    try {
      const result = await this.query(text, Object.values(payload))
      return result.rows[0].id
    } catch (err) {
      console.log(err.stack)
      return 0
    }
  }

  public getFile = async (payload: FileGetPayload): Promise<File | undefined> => {
    try {
      const result = await this.query('SELECT path, original_filename FROM file WHERE id = $1', [
        payload.id,
      ])
      return result.rows[0] as File
    } catch (err) {
      console.log(err.stack)
      return undefined
    }
  }

  public addActionPlugin = async (plugin: ActionPlugin): Promise<boolean> => {
    const text = `INSERT INTO action_plugin (${Object.keys(plugin)}) 
      VALUES (${this.getValuesPlaceholders(plugin)})`
    try {
      await this.query(text, Object.values(plugin))
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }

  public deleteActionPlugin = async (payload: Pick<ActionPlugin, 'code'>): Promise<boolean> => {
    try {
      await this.query('DELETE FROM action_plugin WHERE code = $1', [payload.code])
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }

  public getActionPlugins = async (): Promise<ActionPlugin[]> => {
    try {
      const result = await this.query('SELECT * FROM action_plugin')
      return result.rows as ActionPlugin[]
    } catch (err) {
      console.log(err.stack)
      return []
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
        [payload.template_id, payload.trigger]
      )

      return result.rows as ActionInTemplate[]
    } catch (err) {
      console.log(err.stack)
      return []
    }
  }

  public updateActionPlugin = async (plugin: ActionPlugin): Promise<boolean> => {
    // TODO: Dynamically select what is being updated
    try {
      await this.query(
        'UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6',
        Object.values(plugin)
      )
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }

  public updateTriggerQueue = async (payload: TriggerQueueUpdatePayload): Promise<boolean> => {
    // TODO: Dynamically select what is being updated
    try {
      await this.query('UPDATE trigger_queue SET status = $1 WHERE id = $2', Object.values(payload))
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
