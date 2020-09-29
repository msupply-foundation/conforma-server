import { processTrigger, executeAction } from './triggersAndActions'
import { actionLibrary } from './pluginsConnect'
import * as config from '../config.json'
import { Client, Pool, QueryResult } from 'pg'
import {
  Action,
  ActionQueuePayload,
  DatabaseResult,
  DatabaseRecord,
  PluginPayload,
  QueryPayload,
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

  public query = async (text: string, payload: QueryPayload): Promise<QueryResult> => {
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

  public getActions = async (): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.query('SELECT * FROM action_plugin', [])
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public getActionsByCode = async (): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.query(
        'SELECT code, path, function_name FROM action_plugin',
        []
      )
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public getActionsByTemplate = async (
    tableName: string,
    payload: QueryPayload
  ): Promise<Action[]> => {
    try {
      const result: DatabaseResult = await this.query(
        `SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries FROM template 
         JOIN template_action ON template.id = template_action.template_id 
         JOIN action_plugin ON template_action.action_code = action_plugin.code 
         WHERE template_id = (SELECT template_id FROM ${tableName} WHERE id = $1) AND trigger = $2`,
        payload
      )

      return result.rows as Action[]
    } catch (err) {
      return err.stack
    }
  }

  public getActionsScheduled = async (payload: any = ['Scheduled']): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.query(
        'SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = $1 ORDER BY execution_time',
        payload
      )
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public executeAction = async (payload: any) => {
    try {
      await this.query(
        'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3',
        payload
      )
    } catch (err) {
      return err.stack
    }
  }

  public addPlugin = async (plugin: PluginPayload) => {
    try {
      await this.query(
        'INSERT INTO action_plugin (code, name, description, path, function_name, required_parameters) VALUES ($1, $2, $3, $4, $5, $6);',
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public deleteFromPlugins = async (payload: any) => {
    try {
      await this.query('DELETE FROM action_plugin WHERE code = $1', payload)
    } catch (err) {
      console.log(err.stack)
    }
  }

  public updatePlugin = async (plugin: PluginPayload) => {
    try {
      await this.query(
        'UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6',
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public updateTriggerQueue = async (payload: any) => {
    try {
      await this.query('UPDATE trigger_queue SET status = $1 WHERE id = $2', payload)
    } catch (err) {
      console.log(err.stack)
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
