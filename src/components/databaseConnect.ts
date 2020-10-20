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

  public getOriginalRecordFromActionQueue = GraphQLdb.getOriginalRecordFromActionQueue

  public getTemplateId = async (tableName: string, record_id: number): Promise<number> => {
    let templateId: number
    switch (tableName) {
      case 'application':
      case 'review':
        templateId = await PostgresDB.getTemplateId(tableName, record_id)
        break
      // NB: Check the rest of these queries properly once we have data in the tables
      case 'review_response':
      case 'review_section':
      case 'review_section_assign':
      case 'action_queue':
        templateId = await GraphQLdb.getTemplateId(tableName, record_id)
        break
      default:
        throw new Error('Table name not valid')
    }
    return templateId
  }
}

const dbConnectInstance = DBConnect.Instance
export default dbConnectInstance
