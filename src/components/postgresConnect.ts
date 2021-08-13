import { processTrigger, executeAction } from './actions/triggersAndActions'
import { actionLibrary } from './pluginsConnect'
import config from '../config'
import { Client, Pool, QueryResult } from 'pg'
import {
  ActionInTemplate,
  ActionQueue,
  ActionPlugin,
  FileDownloadInfo,
  ActionQueueExecutePayload,
  ActionQueueGetPayload,
  ActionQueuePayload,
  FilePayload,
  TriggerQueueUpdatePayload,
} from '../types'
import {
  ActionQueueStatus,
  ApplicationOutcome,
  ApplicationStatus,
  Organisation,
  ReviewStatus,
  Trigger,
  User,
} from '../generated/graphql'

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
    listener.on('notification', async ({ channel, payload }) => {
      if (!payload) {
        console.log(`Notification ${channel} received with no payload!`)
        return
      }
      const payloadObject = JSON.parse(payload)
      // "data" is stored output from scheduled trigger or verification
      const data = payloadObject?.trigger_payload?.data
      switch (channel) {
        case 'trigger_notifications':
          processTrigger(payloadObject)
          break
        case 'action_notifications':
          // For Async Actions only
          try {
            await executeAction(payloadObject, actionLibrary, data)
          } catch (err) {
            console.log(err.message)
          } finally {
            break
          }
      }
    })
  }

  public getValuesPlaceholders = (object: { [key: string]: any }) =>
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

  public getCounter = async (counterName: string, increment = true) => {
    const textSelect = 'SELECT value FROM counter WHERE name = $1;'
    const textUpdate = 'UPDATE counter SET value = value + 1 WHERE name = $1;'
    try {
      await this.query({ text: 'BEGIN TRANSACTION;' })
      const result: any = await this.query({ text: textSelect, values: [counterName] })
      if (increment) await this.query({ text: textUpdate, values: [counterName] })
      await this.query({ text: 'COMMIT TRANSACTION;' })
      return result.rows[0]?.value
    } catch (err) {
      throw err
    }
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

  public getActionsProcessing = async (templateId: number): Promise<ActionQueue[]> => {
    const text =
      "SELECT id, action_code, trigger_payload, condition_expression, parameter_queries FROM action_queue WHERE template_id = $1 AND status = 'PROCESSING' ORDER BY sequence"
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

  public triggerScheduledActions = async () => {
    const text = `
      UPDATE trigger_schedule SET trigger = 'ON_SCHEDULE'
        WHERE time_scheduled < NOW()
        AND is_active = true
    `
    try {
      const result = await this.query({ text })
      return true
    } catch (err) {
      throw err
    }
  }

  public resetTrigger = async (
    table: string,
    record_id: number,
    fail = false
  ): Promise<boolean> => {
    const triggerStatus = fail ? Trigger.Error : null
    const text = `UPDATE ${table} SET trigger = $1 WHERE id = $2`
    try {
      const result = await this.query({
        text,
        values: [triggerStatus, record_id],
      })
      return true
    } catch (err) {
      throw err
    }
  }

  public setScheduledActionDone = async (table: string, record_id: number): Promise<boolean> => {
    const text = `UPDATE ${table} SET is_active = false WHERE id = $1`
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

  public addFile = async (payload: FilePayload): Promise<string> => {
    const text = `INSERT INTO file (${Object.keys(payload)}) 
      VALUES (${this.getValuesPlaceholders(payload)}) RETURNING unique_id`
    try {
      const result = await this.query({ text, values: Object.values(payload) })
      return result.rows[0].unique_id
    } catch (err) {
      throw err
    }
  }

  public getFileDownloadInfo = async (
    uid: string,
    thumbnail = false
  ): Promise<FileDownloadInfo | undefined> => {
    const path = thumbnail ? 'thumbnail_path' : 'file_path'
    const text = `SELECT original_filename, ${path} FROM file WHERE unique_id = $1`
    try {
      const result = await this.query({ text, values: [uid] })
      return result.rows[0] as FileDownloadInfo
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

  public getApplicationData = async (applicationId: number) => {
    const text = `
      SELECT application_id as "applicationId",
      serial as "applicationSerial",
      name as "applicationName",
      template_id as "templateId",
      template_name as "templateName",
      template_code as "templateCode",
      stage_id as "stageId", stage_number as "stageNumber", stage,
      stage_history_id as "stageHistoryId",
      stage_history_time_created as "stageHistoryTimeCreated",
      status_history_id as "statusHistoryId", status, status_history_time_created as "statusHistoryTimeCreated",
      user_id as "userId",
      org_id as "orgId",
      outcome
      FROM application_stage_status_latest
      WHERE application_id = $1
    `
    const result = await this.query({ text, values: [applicationId] })
    const applicationData = result.rows[0]
    return applicationData
  }

  public getApplicationResponses = async (applicationId: number) => {
    const text = `
    SELECT DISTINCT ON (code) code, value
    FROM application_response JOIN template_element
    ON template_element.id = application_response.template_element_id
    WHERE application_id = $1
    ORDER BY code, time_updated DESC
    `
    const result = await this.query({ text, values: [applicationId] })
    const responses = result.rows
    return responses
  }

  public getApplicationIdFromTrigger = async (tableName: string, recordId: number) => {
    let text: string
    switch (tableName) {
      case 'application':
        return recordId
      case 'review':
        // NB: Check the rest of these queries properly once we have data in the tables
        text = 'SELECT application_id FROM review WHERE id = $1'
        break
      case 'review_assignment':
        text = 'SELECT application_id FROM review_assignment WHERE id = $1'
        break
      case 'verification':
        text = 'SELECT application_id FROM verification WHERE id = $1'
        break
      case 'trigger_schedule':
        text = 'SELECT application_id FROM trigger_schedule WHERE id = $1'
        break
      // To-Do: queries for other trigger tables
      default:
        throw new Error('Table name not valid')
    }
    const result = await this.query({ text, values: [recordId] })
    return result.rows[0].application_id
  }

  public getTemplateIdFromTrigger = async (
    tableName: string,
    recordId: number
  ): Promise<number> => {
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
      case 'review_assignment':
        text =
          'SELECT template_id FROM application WHERE id = (SELECT application_id FROM review_assignment WHERE id = $1)'
        break
      case 'verification':
        text =
          'SELECT template_id FROM application WHERE id = (SELECT application_id FROM verification WHERE id = $1)'
        break
      case 'trigger_schedule':
        text = 'SELECT template_id FROM trigger_schedule WHERE id = $1'
        break
      default:
        throw new Error('Table name not valid')
    }
    const result = await this.query({ text, values: [recordId] })
    return result.rows[0].template_id
  }

  public getActionsByTemplateId = async (
    templateId: number,
    trigger: Trigger
  ): Promise<ActionInTemplate[]> => {
    const text = `SELECT action_plugin.code, action_plugin.path, action_plugin.name, trigger, template_action.event_code AS event_code, sequence, condition, parameter_queries 
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
    const setMapping = Object.keys(plugin).map((key, index) => `${key} = $${index + 1}`)
    const text = `UPDATE action_plugin SET ${setMapping.join(',')} WHERE code = $${
      setMapping.length + 1
    }`
    // TODO: Dynamically select what is being updated
    try {
      await this.query({ text, values: [...Object.values(plugin), plugin.code] })
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

  public getVerification = async (uid: string) => {
    const text = `
      SELECT unique_id, time_expired, is_verified, message
        FROM verification
        WHERE unique_id = $1`
    try {
      const result = await this.query({ text, values: [uid] })
      return result.rows[0]
    } catch (err) {
      throw err
    }
  }

  public setVerification = async (uid: string) => {
    const text = `
      UPDATE verification
      SET is_verified = true, trigger = 'ON_VERIFICATION'
      WHERE unique_id = $1;`
    try {
      await this.query({ text, values: [uid] })
      return true
    } catch (err) {
      throw err
    }
  }

  // Join a user to an org in user_organisation table
  public addUserOrg = async (userOrg: any): Promise<object> => {
    const text = `INSERT INTO user_organisation (${Object.keys(userOrg)}) 
      VALUES (${this.getValuesPlaceholders(userOrg)})
      RETURNING id`
    try {
      const result = await this.query({ text, values: Object.values(userOrg) })
      return { userOrgId: result.rows[0].id, success: true }
    } catch (err) {
      throw err
    }
  }

  // Used by triggers/actions -- please don't modify
  public getUserData = async (userId: number, orgId: number) => {
    const text = `
      SELECT first_name as "firstName",
      last_name as "lastName",
      username, date_of_birth as "dateOfBirth",
      email
      FROM "user"
      WHERE id = $1
      `
    const text2 = `
      SELECT name as "orgName"
      FROM organisation
      WHERE id = $1
      `
    try {
      const result = await this.query({ text, values: [userId] })
      const userData = { ...result.rows[0], orgName: null }
      if (orgId) {
        const orgResult = await this.query({ text: text2, values: [orgId] })
        userData.orgName = orgResult.rows[0].orgName
      }
      return userData
    } catch (err) {
      throw err
    }
  }

  public getUserOrgData = async ({ username, userId }: any) => {
    const queryText = `
      SELECT user_id as "userId",
        first_name as "firstName",
        last_name as "lastName",
        username,
        date_of_birth as "dateOfBirth",
        email,
        password_hash as "passwordHash",
        org_id as "orgId",
        org_name as "orgName",
        user_role as "userRole",
        registration,
        address,
        logo_url as "logoUrl"
        FROM user_org_join`
    const text = userId ? `${queryText} WHERE user_id = $1` : `${queryText} WHERE username = $1`
    try {
      const result = await this.query({ text, values: [userId ? userId : username] })
      return result.rows
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
      // Check if table and field actually exist -- return true if not
      const text = `
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE table_name = $1
        AND column_name = $2
      `
      try {
        const result = await this.query({ text, values: [table, field] })
        return !Boolean(Number(result.rows[0].count))
      } catch {
        throw err
      }
      throw err
    }
  }

  public setApplicationOutcome = async (
    appId: number,
    outcome: ApplicationOutcome
  ): Promise<boolean> => {
    // Note: There is a trigger in Postgres DB that automatically updates the `is_active` field to False when outcome is set to "APPROVED" or "REJECTED"
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

  public getCurrentStageStatusHistory = async (applicationId: number) => {
    const text = `
      SELECT stage_id AS "stageId",
      stage_number AS "stageNumber",
      stage,
      stage_history_id AS "stageHistoryId",
      stage_history_time_created AS "stageHistoryTimeCreated",
      status_history_id AS "statusHistoryId",
      status,
      status_history_time_created AS "statusHistoryTimeCreated"
      FROM application_stage_status_latest 
      WHERE application_id = $1
    `
    try {
      const result = await this.query({ text, values: [applicationId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getNextStage = async (templateId: number, currentStageNumber = 0) => {
    const text = `SELECT id as stage_id, number as stage_number, title from template_stage
    WHERE template_id = $1
    AND number = (
      SELECT min(number) from template_stage
      WHERE number > $2
    )`
    try {
      const result = await this.query({ text, values: [templateId, currentStageNumber] })
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

  public addNewApplicationStatusHistory = async (
    stageHistoryId: number,
    status: ApplicationStatus = ApplicationStatus.Draft
  ) => {
    // Note: switching is_current of previous status_histories to False is done automatically by a Postgres trigger function
    const text =
      'INSERT into application_status_history (application_stage_history_id, status, time_created) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, status, time_created'
    try {
      const result = await this.query({ text, values: [stageHistoryId, status] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getReviewCurrentStatusHistory = async (reviewId: number) => {
    const text = `SELECT id, status, time_created FROM
      review_status_history WHERE
      review_id = $1 and is_current = true;`
    try {
      const result = await this.query({ text, values: [reviewId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public addNewReviewStatusHistory = async (
    reviewId: number,
    status: ReviewStatus = ReviewStatus.Draft
  ) => {
    // Note: switching is_current of previous status_histories to False is done automatically by a Postgres trigger function
    const text =
      'INSERT into review_status_history (review_id, status) VALUES ($1, $2) RETURNING id, status, time_created'
    try {
      const result = await this.query({ text, values: [reviewId, status] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getUserTemplatePermissions = async (username: string, orgId: number | null) => {
    const text = `SELECT * FROM permissions_all
      WHERE username = $1
      AND "orgId" ${orgId === null ? 'IS NULL' : '= $2'}
      `
    const values: (string | number)[] = [username]
    if (orgId) values.push(orgId)
    try {
      const result = await this.query({ text, values })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getAllPermissions = async () => {
    const text = 'select * from permissions_all'
    try {
      const result = await this.query({ text, values: [] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getAllGeneratedRowPolicies = async () => {
    const text = `
      SELECT policyname, tablename 
      FROM pg_policies 
      WHERE policyname LIKE 'view\_%'
      OR policyname LIKE 'update\_%'
      OR policyname LIKE 'create\_%'
      OR policyname LIKE 'delete\_%'
    `
    try {
      const result = await this.query({ text, values: [] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getUserPermissionNames = async (username: string) => {
    const text = `
    select permission_name.id, permission_name.name 
    from "user"
    join permission_join on "user".id = permission_join.user_id
    join permission_name on permission_name.id = permission_join.permission_name_id
    where "username" = $1
    `
    try {
      const result = await this.query({ text, values: [username] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public joinPermissionNameToUser = async (username: string, permissionName: string) => {
    const text = `
    insert into permission_join (user_id, permission_name_id) 
    values (
        (select id from "user" where username = $1),
        (select id from permission_name where name = $2))
    ON CONFLICT (user_id, permission_name_id)
      WHERE organisation_id IS NULL
    DO
    		UPDATE SET (user_id, is_active) = ((select id from "user" where username = $1), true)
    returning id
    `
    try {
      const result = await this.query({ text, values: [username, permissionName] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public joinPermissionNameToUserOrg = async (
    username: string,
    org: string | number,
    permissionName: string
  ) => {
    const text = `
    INSERT INTO permission_join (user_id, organisation_id, permission_name_id) 
    values (
        (select id from "user" where username = $1),
        ${typeof org === 'number' ? '$2' : '(select id from organisation where name = $2)'},
        (select id from permission_name where name = $3))
    ON CONFLICT (user_id, organisation_id, permission_name_id)
      WHERE organisation_id IS NOT NULL
    DO
    		UPDATE SET (user_id, is_active) = ((select id from "user" where username = $1), true)
    RETURNING id
    `
    try {
      const result = await this.query({ text, values: [username, org, permissionName] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getNumReviewLevels = async (stageId: number) => {
    const text = `
    SELECT MAX(number) FROM template_stage_review_level
    WHERE stage_id = $1
    `
    try {
      const result = await this.query({ text, values: [stageId] })
      return result.rows[0].max
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getReviewStageAndLevel = async (reviewId: number) => {
    const text = `
      SELECT review.level_number AS "levelNumber", stage_number as "stageNumber"
      FROM review WHERE review.id = $1
    `
    try {
      const result = await this.query({ text, values: [reviewId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public isFullyAssignedLevel1 = async (applicationId: number) => {
    const text = `
    SELECT is_fully_assigned_level_1
    FROM application_list()
    WHERE id = $1
    `
    try {
      const result = await this.query({
        text,
        values: [applicationId],
      })
      return result.rows[0].is_fully_assigned_level_1
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getAllApplicationResponses = async (applicationId: number) => {
    const text = `
    SELECT ar.id, template_element_id, code, value, time_updated
    FROM application_response ar JOIN template_element te
    ON ar.template_element_id = te.id
    WHERE application_id = $1
    ORDER BY time_updated
    `
    try {
      const result = await this.query({ text, values: [applicationId] })
      const responses = result.rows
      return responses
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getAllReviewResponses = async (reviewId: number) => {
    const text = `
    SELECT rr.id, r.level_number, code, comment, decision, rr.status, rr.template_element_id,
    rr.application_response_id, rr.review_response_link_id, rr.time_updated
    FROM review_response rr JOIN application_response ar
    ON rr.application_response_id = ar.id
    JOIN template_element te ON ar.template_element_id = te.id
    JOIN review r ON rr.review_id = r.id
    WHERE review_id = $1
    ORDER BY time_updated
    `
    try {
      const result = await this.query({ text, values: [reviewId] })
      const responses = result.rows
      return responses
    } catch (err) {
      console.log(err.message)
      throw err
    }
  }

  public getDatabaseInfo: GetDatabaseInfo = async (tableName = '') => {
    const whereClause = tableName ? `where table_name = '${tableName}'` : ''
    const values = tableName ? [tableName] : []
    try {
      const result = await this.query({
        text: `SELECT * FROM schema_columns ${whereClause}`,
        values,
      })
      const responses = result.rows as SchemaColumn[]
      return responses
    } catch (err) {
      console.log(err.message)
      throw new Error('Problem getting database info')
    }
  }

  public getPermissionPolicies: GetPermissionPolicies = async () => {
    try {
      const result = await this.query({
        text: 'SELECT id, rules FROM permission_policy',
      })
      const responses = result.rows as permissionPolicyColumns[]
      return responses
    } catch (err) {
      console.log(err.message)
      throw new Error('Problem getting permission policies')
    }
  }
}

export type permissionPolicyColumns = {
  id: number
  rules: object
}

type GetPermissionPolicies = () => Promise<permissionPolicyColumns[]>

type SchemaColumn = {
  table_name: string
  table_type: 'BASE TABLE' | 'VIEW'
  column_name: string
  is_nullable: 'YES' | 'NO'
  is_generated: 'ALWAYS' | 'NEVER'
  data_type: 'USER-DEFINED' | 'jsonb' | 'ARRAY' | string // only interested in USER-DEFINED (enum), jsonb and array
  sub_data_type: 'USER-DEFINED' | string // this is for arry type, only interested in USER-DEFINED (enum)
  constraint_type: 'PRIMARY KEY' | 'FOREIGN KEY' | 'UNIQUE' | null
  fk_to_table_name: string | null
  fk_to_column_name: string | null
}
type GetDatabaseInfo = (tableName?: string) => Promise<SchemaColumn[]>

const postgressDBInstance = PostgresDB.Instance
export default postgressDBInstance
