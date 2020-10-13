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
  User,
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
      throw err
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

  public query = async (expression: {
    text: string
    values?: any[]
    rowMode?: string
  }): Promise<QueryResult> => {
    const client = await this.pool.connect()
    try {
      return await client.query(expression)
    } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
    }
  }

  public end = () => {
    this.pool.end()
  }

  public addActionQueue = async (action: ActionQueuePayload): Promise<boolean> => {
    const text = `INSERT into action_queue (${Object.keys(action)}, time_queued) 
      VALUES (${this.getValuesPlaceholders(action)}, CURRENT_TIMESTAMP)`

    try {
      await this.query({ text, values: Object.values(action) })
      return true
    } catch (err) {
      throw err
    }
  }

  public executedActionStatusUpdate = async (
    payload: ActionQueueExecutePayload
  ): Promise<boolean> => {
    const text =
      'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3'
    try {
      await this.query({ text, values: Object.values(payload) })
      return true
    } catch (err) {
      throw err
    }
  }

  public getActionsQueued = async (
    payload: ActionQueueGetPayload = { status: 'Scheduled' }
  ): Promise<ActionQueue[]> => {
    const text =
      'SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = $1 ORDER BY execution_time'
    try {
      const result = await this.query({
        text,
        values: Object.values(payload),
      })
      return result.rows as ActionQueue[]
    } catch (err) {
      throw err
    }
  }

  public addFile = async (payload: FilePayload): Promise<number> => {
    const text = `INSERT INTO file (${Object.keys(payload)}) 
      VALUES (${this.getValuesPlaceholders(payload)}) RETURNING id`

    try {
      const result = await this.query({ text, values: Object.values(payload) })
      return result.rows[0].id
    } catch (err) {
      throw err
    }
  }

  public getFile = async (payload: FileGetPayload): Promise<File | undefined> => {
    const text = 'SELECT path, original_filename FROM file WHERE id = $1'
    try {
      const result = await this.query({ text, values: [payload.id] })
      return result.rows[0] as File
    } catch (err) {
      throw err
    }
  }

  public addActionPlugin = async (plugin: ActionPlugin): Promise<boolean> => {
    const text = `INSERT INTO action_plugin (${Object.keys(plugin)}) 
      VALUES (${this.getValuesPlaceholders(plugin)})`
    try {
      await this.query({ text, values: Object.values(plugin) })
      return true
    } catch (err) {
      throw err
    }
  }

  public deleteActionPlugin = async (payload: Pick<ActionPlugin, 'code'>): Promise<boolean> => {
    const text = 'DELETE FROM action_plugin WHERE code = $1'
    try {
      await this.query({ text, values: [payload.code] })
      return true
    } catch (err) {
      throw err
    }
  }

  public getActionPlugins = async (): Promise<ActionPlugin[]> => {
    const text = 'SELECT * FROM action_plugin'
    try {
      const result = await this.query({ text })
      return result.rows as ActionPlugin[]
    } catch (err) {
      throw err
    }
  }

  public getActionPluginsByTemplate = async (
    tableName: string,
    payload: ActionInTemplateGetPayload
  ): Promise<ActionInTemplate[]> => {
    const text = `SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries 
    FROM template 
    JOIN template_action ON template.id = template_action.template_id 
    JOIN action_plugin ON template_action.action_code = action_plugin.code 
    WHERE template_id = (SELECT template_id FROM ${tableName} WHERE id = $1) AND trigger = $2`

    try {
      const result = await this.query({ text, values: [payload.template_id, payload.trigger] })
      return result.rows as ActionInTemplate[]
    } catch (err) {
      throw err
    }
  }

  public updateActionPlugin = async (plugin: ActionPlugin): Promise<boolean> => {
    const text =
      'UPDATE action_plugin SET name = $2, description = $3, path = $4, function_name = $5, required_parameters = $6 WHERE code = $1'
    // TODO: Dynamically select what is being updated
    try {
      await this.query({ text, values: Object.values(plugin) })
      return true
    } catch (err) {
      throw err
    }
  }

  public updateTriggerQueue = async (payload: TriggerQueueUpdatePayload): Promise<boolean> => {
    const text = 'UPDATE trigger_queue SET status = $1 WHERE id = $2'
    // TODO: Dynamically select what is being updated
    try {
      await this.query({ text, values: Object.values(payload) })
      return true
    } catch (err) {
      throw err
    }
  }

  public createUser = async (user: User): Promise<boolean> => {
    const text = `INSERT INTO "user" (${Object.keys(user)}) 
      VALUES (${this.getValuesPlaceholders(user)})`
    try {
      await this.query({ text, values: Object.values(user) })
      return true
    } catch (err) {
      throw err
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
