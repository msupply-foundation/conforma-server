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
  ActionSequential,
} from '../types'
import { ApplicationOutcome, Trigger, User } from '../generated/graphql'

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
          // For Async Actions only
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
  ): Promise<ActionQueueExecutePayload> => {
    const text =
      'UPDATE action_queue SET status = $1, error_log = $2, parameters_evaluated = $3, output = $4, time_completed = CURRENT_TIMESTAMP WHERE id = $5'
    try {
      await this.query({ text, values: Object.values(payload) })
      return { ...payload }
    } catch (err) {
      throw err
    }
  }

  public getActionsScheduled = async (
    payload: ActionQueueGetPayload = { status: 'Scheduled' }
  ): Promise<ActionQueue[]> => {
    const text =
      'SELECT id, action_code, trigger_payload, parameter_queries, time_completed FROM action_queue WHERE status = $1 ORDER BY time_completed'
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

  public getActionsProcessing = async (templateId: number): Promise<ActionQueue[]> => {
    const text =
      "SELECT id, action_code, trigger_payload, parameter_queries FROM action_queue WHERE template_id = $1 AND status = 'Processing' ORDER BY sequence"
    try {
      const result = await this.query({
        text,
        values: [templateId],
      })
      return result.rows as ActionQueue[]
    } catch (err) {
      throw err
    }
  }

  public updateActionParametersEvaluated = async (action_id: number, parameters: any) => {
    const text = 'UPDATE action_queue SET parameters_evaluated = $1 WHERE id = $2'
    try {
      const result = await this.query({
        text,
        values: [parameters, action_id],
      })
      return true
    } catch (err) {
      throw err
    }
  }

  public resetTrigger = async (table: string, record_id: number): Promise<boolean> => {
    const text = `UPDATE ${table} SET trigger = NULL WHERE id = $1`
    try {
      const result = await this.query({
        text,
        values: [record_id],
      })
      return true
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

  public getTemplateId = async (tableName: string, record_id: number): Promise<number> => {
    let text: string
    switch (tableName) {
      case 'application':
        text = 'SELECT template_id FROM application WHERE id = $1'
        break
      case 'review':
        // NB: Check the rest of these queries properly once we have data in the tables
        text =
          'SELECT template_id FROM application WHERE id = (SELECT application_id FROM review WHERE id = $1)'
        break
      default:
        throw new Error('Table name not valid')
    }
    const result = await this.query({ text, values: [record_id] })
    return result.rows[0].template_id
  }

  public getActionsByTemplateId = async (
    templateId: number,
    trigger: Trigger
  ): Promise<ActionInTemplate[]> => {
    const text = `SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, sequence, condition, parameter_queries 
    FROM template 
    JOIN template_action ON template.id = template_action.template_id 
    JOIN action_plugin ON template_action.action_code = action_plugin.code 
    WHERE template_id = $1 AND trigger = $2
    ORDER BY sequence NULLS FIRST`

    try {
      const result = await this.query({ text, values: [templateId, trigger] })
      return result.rows as ActionInTemplate[]
    } catch (err) {
      throw err
    }
  }

  public updateActionPlugin = async (plugin: ActionPlugin): Promise<boolean> => {
    const text =
      'UPDATE action_plugin SET name = $2, description = $3, path = $4, function_name = $5, required_parameters = $6, output_properties = $7 WHERE code = $1'
    // TODO: Dynamically select what is being updated
    try {
      await this.query({ text, values: Object.values(plugin) })
      return true
    } catch (err) {
      throw err
    }
  }

  public updateTriggerQueueStatus = async (
    payload: TriggerQueueUpdatePayload
  ): Promise<boolean> => {
    const text = 'UPDATE trigger_queue SET status = $1 WHERE id = $2'
    // TODO: Dynamically select what is being updated
    try {
      await this.query({ text, values: Object.values(payload) })
      return true
    } catch (err) {
      throw err
    }
  }

  public createUser = async (user: User): Promise<object> => {
    const text = `INSERT INTO "user" (${Object.keys(user)}) 
      VALUES (${this.getValuesPlaceholders(user)})
      RETURNING id`
    try {
      const result = await this.query({ text, values: Object.values(user) })
      return { userId: result.rows[0].id, success: true }
    } catch (err) {
      throw err
    }
  }

  public isUnique = async (table: string, field: string, value: string): Promise<boolean> => {
    const text = `SELECT COUNT(*) FROM "${table}" WHERE LOWER(${field}) = LOWER($1)`
    try {
      const result = await this.query({ text, values: [value] })
      return !Boolean(Number(result.rows[0].count))
    } catch (err) {
      throw err
    }
  }

  public setApplicationOutcome = async (
    appId: number,
    outcome: ApplicationOutcome
  ): Promise<boolean> => {
    // Note: There is a trigger in Postgres DB that automatically updates the `is_active` field to False when outcome is set to "Approved" or "Rejected"
    const text = 'UPDATE application SET outcome = $1  WHERE id = $2'
    try {
      await this.query({ text, values: [outcome, appId] })
      return true
    } catch (err) {
      console.log(err.stack)
      return false
    }
  }

  public getTemplateStages = async (templateId: number) => {
    const text = 'SELECT id, number, title FROM template_stage WHERE template_id = $1'
    try {
      const result = await this.query({ text, values: [templateId] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getCurrentStageHistory = async (applicationId: number) => {
    const text =
      'SELECT id, stage_id FROM application_stage_history WHERE application_id = $1 and is_current = true'
    try {
      const result = await this.query({ text, values: [applicationId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public addNewStageHistory = async (applicationId: number, stageId: number) => {
    // Note: switching is_current of previous stage_histories to False is done automatically by a Postgres trigger function
    const text =
      'INSERT into application_stage_history (application_id, stage_id, time_created) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id'
    try {
      const result = await this.query({ text, values: [applicationId, stageId] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getCurrentStatusFromStageHistoryId = async (stageHistoryId: number) => {
    const text =
      'SELECT id, status FROM application_status_history WHERE application_stage_history_id = $1 AND is_current = true'
    try {
      const result = await this.query({ text, values: [stageHistoryId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public relinkStatusHistory = async (stageHistoryId: number) => {
    const text = 'UPDATE application_status_history SET application_stage_history_id = $1'
    try {
      await this.query({ text, values: [stageHistoryId] })
      return true
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public addNewStatusHistory = async (stageHistoryId: number, status = 'Draft') => {
    // Note: switching is_current of previous status_histories to False is done automatically by a Postgres trigger function
    const text =
      'INSERT into application_status_history (application_stage_history_id, status, time_created) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, status'
    try {
      const result = await this.query({ text, values: [stageHistoryId, status] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }
}

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
