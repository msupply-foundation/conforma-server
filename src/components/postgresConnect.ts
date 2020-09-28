import { processTrigger, executeAction } from './triggersAndActions'
import { actionLibrary, actionSchedule } from './pluginsConnect'
import * as config from '../config.json'
import { Pool } from 'postgres-pool'
import { QueryResult } from 'pg'
import {
  Action,
  ActionPayload,
  DatabaseResult,
  DatabaseRecord,
  PluginPayload,
  QueryPayload,
} from '../types'

class PostgresDB {
  private static _instance: PostgresDB
  private client: Pool

  constructor() {
    console.log('test')
    this.pool = new Pool(config.pg_database_connection)

    // pool.on('notification', (msg: DatabaseRecord) => {
    //   switch (msg.channel) {
    //     case 'trigger_notifications':
    //       processTrigger(pgClient, JSON.parse(msg.payload))
    //       break
    //     case 'action_notifications':
    //       executeAction(pgClient, JSON.parse(msg.payload), actionLibrary)
    //       break
    //   }
    //   // console.log(msg.payload);
    // })

    this.pool.query('LISTEN trigger_notifications')
    this.pool.query('LISTEN action_notifications')
  }

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public makeQuery = (query: string, payload: QueryPayload): Promise<QueryResult> =>
    this.pool.query(query, payload)

  public addActionQueue = async (action: ActionQueuePayload): Promise<QueryResult> =>
    await this.makeQuery(
      'INSERT into action_queue (trigger_event, action_code, parameters, status, time_queued) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      Object.values(action)
    )

  public getActions = async (): Promise<DatabaseRecord[]> => {
    const result: DatabaseResult = await this.makeQuery('SELECT * FROM action_plugin', [])
    return result.rows
  }

  public getActionsByCode = async (): Promise<DatabaseRecord[]> => {
    const result: DatabaseResult = await this.makeQuery(
      'SELECT code, path, function_name FROM action_plugin',
      []
    )
    return result.rows
  }

  public getActionsByTemplate = async (payload: QueryPayload): Promise<Action[]> => {
    const result: DatabaseResult = await this.makeQuery(
      'SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, condition, parameter_queries FROM template JOIN template_action ON template.id = template_action.template_id JOIN action_plugin ON template_action.action_code = action_plugin.code WHERE template_id = (SELECT template_id from $1 WHERE id = $2) AND trigger = $3',
      payload
    )
    return result.rows as Action[]
  }

  public getActionsScheduled = async () => {
    const result: DatabaseResult = await this.makeQuery(
      'SELECT id, action_code, parameters, execution_time FROM action_queue WHERE status = "Scheduled" ORDER BY execution_time',
      []
    )
    return result.rows
  }

  public executeAction = async (payload: QueryPayload): Promise<QueryResult> =>
    await this.makeQuery(
      'UPDATE action_queue SET status = $1, error_log = $2, execution_time = CURRENT_TIMESTAMP WHERE id = $3',
      payload
    )

  public addPlugin = async (plugin: PluginPayload): Promise<QueryResult> =>
    await this.makeQuery(
      'INSERT INTO action_plugin (code, name, description, path, function_name, required_parameters) VALUES ($1, $2, $3, $4, $5, $6);',
      Object.values(plugin)
    )

  public deleteFromPlugins = async (payload: QueryPayload): Promise<QueryResult> =>
    await this.makeQuery('DELETE FROM action_plugin WHERE code = $1', payload)

  public updatePlugin = async (plugin: PluginPayload): Promise<QueryResult> =>
    await this.makeQuery(
      'UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6',
      Object.values(plugin)
    )

  public updateTriggerQueue = async (payload: QueryPayload): Promise<QueryResult> =>
    this.makeQuery('UPDATE trigger_queue SET status = $1 WHERE id = $2', payload)
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
