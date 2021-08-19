import path from 'path'
import { getAppEntryPointDir } from '../utilityFunctions'
import config from '../../config'

export const DEFAULT_SNAPSHOT_NAME = 'current'
export const DEFAULT_OPTIONS_NAME = 'default'
export const SNAPSHOT_SUBFOLDER = '_snapshots'
export const OPTIONS_SUBFOLDER = 'snapshotOptions'
export const SNAPSHOT_FILE_NAME = 'snapshot'
export const OPTIONS_FILE_NAME = 'options'
export const PG_DIFF_CONFIG_FILE_NAME = 'pg-diff-config'
export const PG_SCHEMA_DIFF_FILE_NAME = 'schema_diff'

export const ROOT_FOLDER = path.join(getAppEntryPointDir(), '../')
export const DATABASE_FOLDER = path.join(getAppEntryPointDir(), config.databaseFolder)
export const SNAPSHOT_FOLDER = path.join(DATABASE_FOLDER, SNAPSHOT_SUBFOLDER)
export const SNAPSHOT_OPTIONS_FOLDER = path.join(DATABASE_FOLDER, OPTIONS_SUBFOLDER)
export const FILES_FOLDER = path.join(getAppEntryPointDir(), config.filesFolder)

export const PG_DFF_JS_LOCATION = path.join(
  getAppEntryPointDir(),
  config.nodeModulesFolder,
  'pg-diff-cli',
  'main.js'
)
