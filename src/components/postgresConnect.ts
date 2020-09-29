import { processTrigger, executeAction } from './triggersAndActions'
import { actionLibrary, actionSchedule } from './pluginsConnect'
import * as config from '../config.json'
import { Pool, QueryResult } from 'pg'
import {
  Action,
  ActionQueue,
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

    // this.pool.on('notification', (msg: DatabaseRecord) => {
    //   switch (msg.channel) {
    //     case 'trigger_notifications':
    //       processTrigger(JSON.parse(msg.payload))
    //       break
    //     case 'action_notifications':
    //       executeAction(JSON.parse(msg.payload), actionLibrary)
    //       break
    //   }
    //   // console.log(msg.payload);
    // })

    // this.pool.query('LISTEN trigger_notifications')
    // this.pool.query('LISTEN action_notifications')
  }

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public makeQuery = async (query: string, payload: QueryPayload): Promise<QueryResult> => {
    const client = await this.pool.connect()
    try {
      return await client.query(query, payload)
    } finally {
      // Make sure to release the client before any error handling,
      // just in case the error handling itself throws an error.
      client.release()
    }
  }

  public addActionQueue = async (action: ActionQueuePayload) => {
    try {
      const result = await this.makeQuery(
        'INSERT into action_queue (trigger_event, action_code, parameters, status, time_queued) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
        Object.values(action)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public getActions = async (): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.makeQuery('SELECT * FROM action_plugin', [])
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public getActionsByCode = async (): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.makeQuery(
        'SELECT code, path, function_name FROM action_plugin',
        []
      )
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public getActionsByTemplate = async (payload: any): Promise<Action[]> => {
    try {
      const result: DatabaseResult = await this.makeQuery(
        'SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries FROM template JOIN template_action ON template.id = template_action.template_id JOIN action_plugin ON template_action.action_code = action_plugin.code WHERE template_id = (SELECT template_id from $1 WHERE id = $2) AND trigger = $3',
        payload
      )
      return result.rows as Action[]
    } catch (err) {
      return err.stack
    }
  }

  public getActionsScheduled = async (): Promise<DatabaseRecord[]> => {
    try {
      const result: DatabaseResult = await this.makeQuery(
        'SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = "Scheduled" ORDER BY execution_time',
        []
      )
      console.log(result.rows)
      return result.rows
    } catch (err) {
      return err.stack
    }
  }

  public executeAction = async (payload: any) => {
    try {
      await this.makeQuery(
        'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3',
        payload
      )
    } catch (err) {
      return err.stack
    }
  }

  public addPlugin = async (plugin: PluginPayload) => {
    try {
      await this.makeQuery(
        'INSERT INTO action_plugin (code, name, description, path, function_name, required_parameters) VALUES ($1, $2, $3, $4, $5, $6);',
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public deleteFromPlugins = async (payload: any) => {
    try {
      await this.makeQuery('DELETE FROM action_plugin WHERE code = $1', payload)
    } catch (err) {
      console.log(err.stack)
    }
  }

  public updatePlugin = async (plugin: PluginPayload) => {
    try {
      await this.makeQuery(
        'UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6',
        Object.values(plugin)
      )
    } catch (err) {
      console.log(err.stack)
    }
  }

  public updateTriggerQueue = async (payload: any) => {
    try {
      await this.makeQuery('UPDATE trigger_queue SET status = $1 WHERE id = $2', payload)
    } catch (err) {
      console.log(err.stack)
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
