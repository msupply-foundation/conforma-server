import PostgresDB from './postgresConnect'

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
}

const dbConnectInstance = DBConnect.Instance
export default dbConnectInstance
