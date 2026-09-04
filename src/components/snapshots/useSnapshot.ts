import fs from 'fs/promises'
import fsSync from 'fs'
import fsx from 'fs-extra'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { setTimeout as sleep } from 'node:timers/promises'
import DBConnect from '../../../src/components/database/databaseConnect'
import { updateRowPolicies } from '../permissions/rowLevelPolicyHelpers'
import { UseSnapshotOperation } from '../exportAndImport/types'
import semverCompare from 'semver/functions/compare'
import config from '../../../src/config'
import { refreshConfig } from '../../../src/refreshConfig'
import { createDefaultDataFolders } from '../files/createDefaultFolders'
import migrateData from '../../../database/migration/migrateData'
import {
  FILES_FOLDER,
  SNAPSHOT_FOLDER,
  PREFERENCES_FILE,
  INFO_FILE_NAME,
  PREFERENCES_FOLDER,
  LOCALISATION_FOLDER,
  SNAPSHOT_ARCHIVE_FOLDER,
} from '../../constants'
import { getSnapshotArchives } from '../files/helpers'
import { errorMessage } from '../utilityFunctions'
import { cleanupDataTables } from '../../lookup-table/utils/cleanupDataTables'
import { getTimeString } from './takeSnapshot'
import { reloadFragments } from '../fig-tree-evaluator/FigTree'
import { captureSessionForRestore, reinstateCapturedSession } from '../permissions/sessionRestore'
import { pauseSessionSweep, resumeSessionSweep } from '../permissions/sessionCleanup'

const execFileAsync = promisify(execFile)

const useSnapshot: UseSnapshotOperation = async ({ snapshotName, preserveSessionTokenHash }) => {
  const startTime = Date.now()

  // Ensure relevant folders exist
  await createDefaultDataFolders()

  // While the database is being replaced, the session table describes either
  // nothing or somebody else's system, so the sweep must not read anything into
  // it (see sessionCleanup.ts)
  pauseSessionSweep()

  try {
    console.log(`Restoring snapshot: ${snapshotName}`)

    const snapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)

    if (!fsx.existsSync(snapshotFolder)) throw new Error('Snapshot missing: ' + snapshotName)

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
      throw new Error(
        `Snapshot was created with Conforma version: ${snapshotVersion}\n You can't install a snapshot created with a version newer than the current application version: ${config.version}`
      )
    }
    if (semverCompare(snapshotVersion, '0.8.0') === -1) {
      throw new Error(
        `Snapshot was created with a Conforma version prior to 0.8.0, so its database is incompatible with current versions of Postgres. Please use the v.0.8.0 Docker build, or v0.8.0 git tag (with PG12.17) to import and re-export this snapshot to make it compatible with this version of Conforma.`
      )
    }

    // Check that we can find all the archives needed:
    console.log('Collecting archives...')
    const archiveCollectStartTime = Date.now()
    await collectArchives(snapshotFolder)
    console.log(`Collecting archives...done in ${getTimeString(archiveCollectStartTime)}`)

    // Read out the calling admin's session while the current database still
    // exists -- the restore below destroys every session on the server
    const capturedSession = await captureSessionForRestore(preserveSessionTokenHash)

    // Reset existing files folder (but keep temp archives)
    await removeFiles()

    console.log('Restoring database...')
    const databaseStartTime = Date.now()

    // Safer to drop and recreate whole schema, as there can be errors when
    // trying to drop individual objects using --clean, especially if the
    // incoming database differs from the current database, schema-wise
    const pgOptions = { maxBuffer: 1024 * 1024 * 100 }
    await execFileAsync(
      'psql',
      ['-U', 'postgres', '-d', 'tmf_app_manager', '-c', 'DROP schema public CASCADE;'],
      pgOptions
    ).catch(() => {
      // Ignore errors dropping the schema (e.g. it doesn't exist yet) — matches
      // the previous behaviour of silencing this command's output/failures
    })
    await execFileAsync(
      'psql',
      ['-U', 'postgres', '-d', 'tmf_app_manager', '-c', 'CREATE schema public;'],
      pgOptions
    )
    await execFileAsync(
      'pg_restore',
      [
        '-U',
        'postgres',
        '--clean',
        '--if-exists',
        '--dbname',
        'tmf_app_manager',
        `${snapshotFolder}/database.dump`,
      ],
      pgOptions
    )

    console.log(`Restoring database...done in ${getTimeString(databaseStartTime)}`)

    // Copy files
    console.log('Importing files...')
    const fileCopyStartTime = Date.now()
    await copyFiles(snapshotFolder)
    console.log(`Importing files...done in ${getTimeString(fileCopyStartTime)}`)

    // Import preferences
    try {
      console.log('Importing preferences')
      await fsx.emptyDir(PREFERENCES_FOLDER)
      await fsx.copy(path.join(snapshotFolder, 'preferences.json'), PREFERENCES_FILE)
    } catch (e) {
      console.log("Couldn't import preferences")
      console.log((e as Error).message)
    }

    // Import localisation
    try {
      console.log('Importing localisations')
      await fsx.emptyDir(LOCALISATION_FOLDER)
      await fsx.copy(path.join(snapshotFolder, 'localisation'), LOCALISATION_FOLDER)
    } catch (e) {
      console.log("Couldn't import localisations")
      console.log((e as Error).message)
    }

    // Pause to allow postgraphile "watch" to detect changed schema
    await sleep(1500)

    // Migrate database to latest version
    console.log('Migrating database (if required)...)')
    await migrateData()

    // Regenerate row level policies
    await updateRowPolicies()

    // Only now is the session table certainly present and in its current shape
    // -- a snapshot predating it relies on the migration above to create it
    await reinstateCapturedSession(capturedSession)

    // To ensure generic thumbnails are not wiped out, even if server doesn't restart
    await createDefaultDataFolders()

    // Store snapshot name in database
    const text = `INSERT INTO system_info (name, value)
      VALUES('snapshot', $1)`
    await DBConnect.query({
      text,
      values: [JSON.stringify(snapshotName)],
    })

    await cleanupDataTables()

    await refreshConfig(config)

    reloadFragments()

    console.log('...Snapshot load complete!')
    console.log('Total time:', getTimeString(startTime))

    return { success: true, message: `snapshot loaded ${snapshotName}` }
  } catch (e) {
    return { success: false, message: 'error while loading snapshot', error: errorMessage(e) }
  } finally {
    resumeSessionSweep()
  }
}

const copyFiles = async (snapshotFolder: string) => {
  await fsx.copy(path.join(snapshotFolder, 'files'), FILES_FOLDER, { overwrite: true })

  // Sync archive.json in the central archive store with the snapshot. If the
  // snapshot has no archive.json, the central one must be removed — otherwise
  // a stale list left over from a previously loaded snapshot would be picked
  // up by the next takeSnapshot.
  const sourceArchiveJson = path.join(snapshotFolder, 'archive.json')
  const targetArchiveJson = path.join(SNAPSHOT_ARCHIVE_FOLDER, 'archive.json')
  if (await fsx.pathExists(sourceArchiveJson)) {
    await fsx.copy(sourceArchiveJson, targetArchiveJson)
  } else {
    await fsx.remove(targetArchiveJson)
    console.log('No archive.json in snapshot')
  }
}

// Removes the contents of the "files" folder
const removeFiles = async () => {
  const contents = await fsx.readdir(FILES_FOLDER)
  for (const item of contents) {
    await fsx.remove(path.join(FILES_FOLDER, item))
  }
}

// Verifies that all archives required by the snapshot are present in the
// archive store. Archives live permanently in SNAPSHOT_ARCHIVE_FOLDER so no
// moving is needed — we just confirm nothing is missing.
const collectArchives = async (snapshotFolder: string) => {
  const requiredArchiveFolders = (await getSnapshotArchives(snapshotFolder)).map(
    ({ archiveFolder }) => archiveFolder
  )

  if (requiredArchiveFolders.length === 0) {
    console.log('No archives associated with this snapshot')
    return
  }

  const missingArchives: string[] = []

  for (const folder of requiredArchiveFolders) {
    if (!(await fsx.pathExists(path.join(SNAPSHOT_ARCHIVE_FOLDER, folder)))) {
      missingArchives.push(folder)
    }
  }

  if (missingArchives.length > 0) {
    throw new Error(`Missing archive folders:\n    ${missingArchives.join('\n    ')}`)
  }
}

export default useSnapshot
