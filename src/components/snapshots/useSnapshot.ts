import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import insertData from '../../../database/insertData'
import updateRowPolicies from '../../../database/updateRowPolicies'
import { SnapshotOperation, ExportAndImportOptions } from '../exportAndImport/types'
import importFromJson from '../exportAndImport/importFromJson'

import {
  DEFAULT_SNAPSHOT_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
  FILES_FOLDER,
  ROOT_FOLDER,
  SNAPSHOT_FOLDER,
  SNAPSHOT_OPTIONS_FOLDER,
} from './constants'

const useSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName,
  options: inOptions,
}) => {
  try {
    console.log(`using snapshot, name: ${snapshotName}`)

    const snapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)

    const options = await getOptions(snapshotFolder, optionsName, inOptions)
    const snapshotRaw = await fs.readFile(path.join(snapshotFolder, `${SNAPSHOT_FILE_NAME}.json`), {
      encoding: 'utf-8',
    })
    const snapshotObject = JSON.parse(snapshotRaw)

    if (options.shouldReInitialise) {
      await initiliseDatabase(options, snapshotFolder)
    }

    copyFiles(snapshotFolder, options)

    console.log('inserting from snapshot ... ')
    await importFromJson(snapshotObject, options, options.shouldReInitialise)
    console.log('inserting from snapshot ... done')

    // Update serials
    console.log('running serial update ... ')
    execSync('./database/update_serials.sh', { cwd: ROOT_FOLDER })
    console.log('running serial update ... done')

    // Regenerate row level policies
    await updateRowPolicies()

    if (process.env.NODE_ENV !== 'production') {
      // Post data insert (restart server (for dev) )
      console.log('running post data insert ... ')
      execSync('./database/post_data_insert.sh', { cwd: ROOT_FOLDER })
      console.log('running post data insert ... done')
    }

    if (options.shouldReInitialise) {
      console.log('enable row level policies ... ')
      execSync('./database/turn_on_row_level_security.sh', { cwd: ROOT_FOLDER })
      console.log('enable row level policies ... done')
    }

    return { success: true, message: `snapshot loaded ${snapshotName}` }
  } catch (e) {
    return { success: false, message: 'error while loading snapshot', error: e.toString() }
  }
}
const getOptions = async (
  snapshotFolder: string,
  optionsName?: string,
  options?: ExportAndImportOptions
) => {
  if (options) {
    console.log('use options passed as a parameter')
    return options
  }
  let optionsFile = path.join(snapshotFolder, `${OPTIONS_FILE_NAME}.json`)

  if (optionsName) optionsFile = path.join(SNAPSHOT_OPTIONS_FOLDER, `${optionsName}.json`)
  console.log(`using options from: ${optionsFile}`)
  const optionsRaw = await fs.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  return JSON.parse(optionsRaw) as ExportAndImportOptions
}

const initiliseDatabase = async (
  { insertScriptsLocale, includeInsertScripts, excludeInsertScripts }: ExportAndImportOptions,
  snapshotFolder: string
) => {
  const databaseName = 'tmf_app_manager'

  console.log('initialising database ... ')
  execSync(`./database/initialise_database.sh ${databaseName}`, { cwd: ROOT_FOLDER })
  console.log('initialising database ... done')

  const diffFile = path.join(snapshotFolder, `${PG_SCHEMA_DIFF_FILE_NAME}.sql`)
  if (fsSync.existsSync(diffFile)) {
    console.log('adding changes to schema ... ')
    execSync(`psql -U postgres -q -b -d ${databaseName} -f "${diffFile}"`, { cwd: ROOT_FOLDER })
    console.log('adding changes to schema ... done')
  }

  // console.log('inserting core data ... ')
  // await insertData(insertScriptsLocale, includeInsertScripts, excludeInsertScripts)
  // console.log('inserting core data ... done')
}

const copyFiles = (
  snapshotFolder: string,
  { includeTables, excludeTables }: ExportAndImportOptions
) => {
  if (
    (includeTables.includes('file') || includeTables.length === 0) &&
    !excludeTables.includes('file')
  ) {
    console.log('copying files ...')
    try {
      execSync(`rm -rf filesFolder`)
    } catch (e) {}
    execSync(`cp -R ${snapshotFolder}/files/* ${FILES_FOLDER}`)
    console.log('copying files ... done')
  }
}

export default useSnapshot
