import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import insertData from '../../../database/insertData'
import DBConnect from '../../../src/components/databaseConnect'
import updateRowPolicies from '../../../database/updateRowPolicies'
import { SnapshotOperation, ExportAndImportOptions, ObjectRecord } from '../exportAndImport/types'
import importFromJson from '../exportAndImport/importFromJson'
import { triggerTables } from './triggerTables'
import semverCompare from 'semver/functions/compare'
import config from '../../../src/config'
// @ts-ignore
import delay from 'delay-sync'
import { createDefaultDataFolders } from '../files/createDefaultFolders'
import migrateData from '../../../database/migration/migrateData'

import {
  DEFAULT_SNAPSHOT_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
  FILES_FOLDER,
  ROOT_FOLDER,
  SNAPSHOT_FOLDER,
  SNAPSHOT_OPTIONS_FOLDER,
  LOCALISATION_FOLDER,
  PREFERENCES_FILE,
  SCHEMA_FILE_NAME,
  INFO_FILE_NAME,
  PREFERENCES_FOLDER,
} from '../../constants'

const useSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName,
  options: inOptions,
}) => {
  // Ensure relevant folders exist
  createDefaultDataFolders()

  try {
    console.log(`Using snapshot: ${snapshotName}`)

    const snapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)

    const options = await getOptions(snapshotFolder, optionsName, inOptions)

    // Don't proceed if snapshot version higher than current installation
    const infoFile = path.join(snapshotFolder, `${INFO_FILE_NAME}.json`)
    console.log(`Checking snapshot version...`)
    const snapshotVersion = fsSync.existsSync(infoFile)
      ? JSON.parse(
          await fs.readFile(infoFile, {
            encoding: 'utf-8',
          })
        ).version
      : '0.0.0'
    if (semverCompare(snapshotVersion, config.version) === 1) {
      throw `Snapshot was created with version: ${snapshotVersion}\n You can't install a snapshot created with a version newer than the current application version: ${config.version}`
    }

    if (options.resetFiles || options.usePgDump) {
      execSync(`rm -rf ${FILES_FOLDER}/*`)
    }

    if (options.usePgDump) {
      // The quick way, using pg_restore -- whole database only
      console.log('Restoring database...')
      execSync(
        `pg_restore  -U postgres --clean --if-exists --dbname tmf_app_manager ${snapshotFolder}/database.dump`
      )
      console.log('Restoring database...done')

      // Copy files
      console.log('Importing files...')
      execSync(`cp -a '${snapshotFolder}/files'/. '${FILES_FOLDER}'`)
      console.log('Importing files...done')
    } else {
      // The old way, using JSON database object export. Deprecated for full
      // database export, but kept here for backwards compatibility, and for
      // "custom" (i.e. not full database) snapshots (eg. template
      // import/export)
      const snapshotRaw = await fs.readFile(
        path.join(snapshotFolder, `${SNAPSHOT_FILE_NAME}.json`),
        {
          encoding: 'utf-8',
        }
      )
      const snapshotObject = JSON.parse(snapshotRaw)

      if (options.shouldReInitialise) {
        await initialiseDatabase(options, snapshotFolder)
      }

      // Prevent triggers from running while we insert data, but only for full re-init
      if (options.shouldReInitialise) {
        triggerTables.forEach((table) => {
          execSync(
            `psql -U postgres -d tmf_app_manager -c "ALTER TABLE ${table} DISABLE TRIGGER ALL"`
          )
        })
      }

      console.log('inserting from snapshot ... ')
      const insertedRecords = await importFromJson(
        snapshotObject,
        options,
        options.shouldReInitialise
      )
      console.log('inserting from snapshot ... done')

      // Update serials
      console.log('running serial update ... ')
      execSync('./database/update_serials.sh', { cwd: ROOT_FOLDER, stdio: 'inherit' })
      console.log('running serial update ... done')

      // Re-enable triggers
      triggerTables.forEach((table) => {
        execSync(`psql -U postgres -d tmf_app_manager -c "ALTER TABLE ${table} ENABLE TRIGGER ALL"`)
      })

      await copyFiles(snapshotFolder, insertedRecords.file)
    }

    // Import localisations
    if (options?.includeLocalisation) {
      try {
        execSync(`rm -rf ${LOCALISATION_FOLDER}/*`)
        execSync(`cp -r  '${snapshotFolder}/localisation/.' '${LOCALISATION_FOLDER}' `)
      } catch (e) {
        console.log("Couldn't import localisations")
      }
    }

    // Import preferences
    if (options?.includePrefs) {
      try {
        execSync(`rm -rf ${PREFERENCES_FOLDER}/*`)
        execSync(`cp '${snapshotFolder}/preferences.json' '${PREFERENCES_FILE}'`)
      } catch (e) {
        console.log("Couldn't import preferences")
      }
    }

    // Pause to allow postgraphile "watch" to detect changed schema
    delay(1500)

    // Migrate database to latest version
    console.log('Migrating database (if required)...)')
    await migrateData()

    // Regenerate row level policies
    await updateRowPolicies()

    if (options.shouldReInitialise) {
      console.log('enable row level policies ... ')
      execSync('./database/turn_on_row_level_security.sh', { cwd: ROOT_FOLDER })
      console.log('enable row level policies ... done')
    }

    // To ensure generic thumbnails are not wiped out, even if server doesn't restart
    createDefaultDataFolders()

    // Store snapshot name in database (for full imports only)
    if (options.shouldReInitialise) {
      const text = `INSERT INTO system_info (name, value)
      VALUES('snapshot', $1)`
      await DBConnect.query({
        text,
        values: [JSON.stringify(snapshotName)],
      })
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

  // Check if the snapshot has its own schema script
  const initScript = fsSync.existsSync(path.join(snapshotFolder, `${SCHEMA_FILE_NAME}.sql`))
    ? `${path.join(snapshotFolder, SCHEMA_FILE_NAME)}.sql`
    : ''

  console.log('initialising database ... ')

  execSync(`./database/initialise_database.sh ${databaseName} ${initScript}`, {
    cwd: ROOT_FOLDER,
    stdio: 'inherit',
  })
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
