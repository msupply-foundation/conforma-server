import DBConnect from '../database/databaseConnect'
import { referencedArchiveFolders } from './snapshotStore'

// The archive folders the current database points into. Kept apart from
// snapshotStore so that module stays free of database imports and its pure
// functions can be unit tested without a connection.
export const getLiveArchiveFolders = async (): Promise<string[]> =>
  referencedArchiveFolders(await DBConnect.getReferencedArchives())
