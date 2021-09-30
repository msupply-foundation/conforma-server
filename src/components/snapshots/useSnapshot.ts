import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import insertData from '../../../database/insertData'
import updateRowPolicies from '../../../database/updateRowPolicies'
import { SnapshotOperation, ExportAndImportOptions, ObjectRecord } from '../exportAndImport/types'
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
      await initialiseDatabase(options, snapshotFolder)
    }

    if (options.resetFiles) {
      execSync(`rm -rf ${FILES_FOLDER}/*`)
    }

    console.log('inserting from snapshot ... ')
    const insertedRecords = await importFromJson(
      snapshotObject,
      options,
      options.shouldReInitialise
    )
    console.log('inserting from snapshot ... done')

    await copyFiles(snapshotFolder, insertedRecords.file)

    // Update serials
    console.log('running serial update ... ')
    execSync('./database/update_serials.sh', { cwd: ROOT_FOLDER })
    console.log('running serial update ... done')

    // Regenerate row level policies
    await updateRowPolicies()

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

const convertDeprecated = (options: ExportAndImportOptions) => {
  // see comment in ExportAndImportOptions type
  return {
    ...options,
    skipTableOnInsertFail: options.skipTableOnInsertFail || options.tablesToUpdateOnInsertFail,
  }
}

const getOptions = async (
  snapshotFolder: string,
  optionsName?: string,
  options?: ExportAndImportOptions
) => {
  if (options) {
    console.log('use options passed as a parameter')
    return convertDeprecated(options)
  }
  let optionsFile = path.join(snapshotFolder, `${OPTIONS_FILE_NAME}.json`)

  if (optionsName) optionsFile = path.join(SNAPSHOT_OPTIONS_FOLDER, `${optionsName}.json`)
  console.log(`using options from: ${optionsFile}`)
  const optionsRaw = await fs.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  return convertDeprecated(JSON.parse(optionsRaw) as ExportAndImportOptions)
}

const initialiseDatabase = async (
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

    let dbPatch = `psql -v -U postgres -q -b -d ${databaseName} -f "${diffFile}"`

    // run db patch twice (in silenced error mode), to make sure references that were not met the first time will be met the second time
    execSync(dbPatch, { cwd: ROOT_FOLDER })
    execSync(dbPatch, { cwd: ROOT_FOLDER })

    console.log('adding changes to schema ... done')
  }

  console.log('inserting core data ... ')
  await insertData(insertScriptsLocale, includeInsertScripts, excludeInsertScripts)
  console.log('inserting core data ... done')
}

export const getDirectoryFromPath = (filePath: string) => {
  const [_, ...directory] = filePath.split('/').reverse()
  return directory.join('/')
}
// Get base files (thumbnails)
export const getBaseFiles = async (filesFolder: string) => {
  try {
    let dirents = await fs.readdir(filesFolder, {
      encoding: 'utf-8',
      withFileTypes: true,
    })
    return dirents
      .filter((dirent) => !dirent.isDirectory() && !dirent.name.startsWith('.'))
      .map((dirent) => dirent.name)
  } catch {
    return []
  }
}

const copyFiles = async (snapshotFolder: string, fileRecords: ObjectRecord[] = []) => {
  // copy only files that associated with import file records and base filed in snapshot folder (thumbnails)
  const filePaths = fileRecords.map((oldAndNewFileRecord) => oldAndNewFileRecord.new.filePath)
  filePaths.push(...fileRecords.map((oldAndNewFileRecord) => oldAndNewFileRecord.new.thumbnailPath))
  const snapshotFilesFolder = `${snapshotFolder}/files`
  const baseFilePaths = await getBaseFiles(snapshotFilesFolder)

  for (const filePath of [...filePaths, ...baseFilePaths]) {
    try {
      console.log('copying file', filePath)

      const destinationDirectory = `${FILES_FOLDER}/${getDirectoryFromPath(filePath)}`
      // -p = no error if exists, create parent
      execSync(`mkdir -p '${destinationDirectory}'`)

      execSync(`cp '${snapshotFilesFolder}/${filePath}' '${destinationDirectory}'`)
    } catch (e) {
      console.log('failed to copy file', e)
    }
  }
}

export default useSnapshot
