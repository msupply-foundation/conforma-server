import PostgresDB from './postgresConnect'
import GraphQLdb from './graphQLConnect'

class DBConnect {
  private static _instance: DBConnect

  constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public query = PostgresDB.query

  public end = PostgresDB.end

  public addActionQueue = PostgresDB.addActionQueue

  public executedActionStatusUpdate = PostgresDB.executedActionStatusUpdate

  public getActionsQueued = PostgresDB.getActionsQueued

  public addFile = PostgresDB.addFile

  public getFile = PostgresDB.getFile

  public addActionPlugin = PostgresDB.addActionPlugin

  public deleteActionPlugin = PostgresDB.deleteActionPlugin

  public getActionPlugins = PostgresDB.getActionPlugins

  public getActionPluginsByTemplate = PostgresDB.getActionPluginsByTemplate

  public updateActionPlugin = PostgresDB.updateActionPlugin

  public updateTriggerQueue = PostgresDB.updateTriggerQueue

  public createUser = PostgresDB.createUser

  public isUnique = PostgresDB.isUnique

  public setApplicationOutcome = PostgresDB.setApplicationOutcome

  public getTemplateId = async (tableName: string, record_id: number): Promise<number> => {
    let templateId: number
    switch (tableName) {
      case 'application' || 'review':
        templateId = await PostgresDB.getTemplateId(tableName, record_id)
        break
      // NB: Check the rest of these queries properly once we have data in the tables
      case 'review_response' || 'review_section' || 'review_section_assign' || 'action_queue':
        throw new Error('Not yet implemented')

      default:
        throw new Error('Table name not valid')
    }

    return templateId
  }
}

const dbConnectInstance = DBConnect.Instance
export default dbConnectInstance
