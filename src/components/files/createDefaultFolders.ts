// Creates (and populates if appropriate) the folders that are not saved as part
// of git repo. We run this for safety when starting the server, or before
// saving or loading a snapshot.

import {
  PREFERENCES_FOLDER,
  PREFERENCES_FILE_NAME,
  LOCALISATION_FOLDER,
  FILES_FOLDER,
  SNAPSHOT_FOLDER,
  BACKUPS_FOLDER,
  BASE_SNAPSHOT_FOLDER,
  GENERIC_THUMBNAILS_FOLDER,
  GENERIC_THUMBNAILS_SOURCE_FOLDER,
  DATABASE_FOLDER,
  BASE_SNAPSHOT_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  ZIP_CACHE_FOLDER,
  STAGED_DOWNLOAD_FOLDER,
} from '../../constants'
import fsx from 'fs-extra'
import path from 'path'
import { makeFolder } from '../utilityFunctions'

export async function createDefaultDataFolders() {
  try {
    makeFolder(SNAPSHOT_FOLDER, 'Creating SNAPSHOTS folder')
    makeFolder(SNAPSHOT_ARCHIVE_FOLDER)
    makeFolder(BACKUPS_FOLDER, 'Creating BACKUPS folder')
    makeFolder(ZIP_CACHE_FOLDER, 'Creating ZIP CACHE folder')
    // Wipe staged-downloads on every boot — in-progress downloads don't
    // survive a restart, and we don't want lingering files from previous runs.
    await fsx.emptyDir(STAGED_DOWNLOAD_FOLDER) // Also creates if missing
    // Copy core_templates to snapshots folder
    await fsx.copy(
      path.join(DATABASE_FOLDER, BASE_SNAPSHOT_NAME),
      path.join(SNAPSHOT_FOLDER, BASE_SNAPSHOT_NAME)
    )
  } catch {
    console.log('\nProblem creating SNAPSHOTS folder\n')
  }

  try {
    if (!(await fsx.pathExists(FILES_FOLDER))) {
      makeFolder(FILES_FOLDER, 'Creating FILES folder')
      await fsx.copy(path.join(BASE_SNAPSHOT_FOLDER, 'files'), FILES_FOLDER)
    }
    // Restore generic thumbnails, they get wiped out during snapshot loading
    makeFolder(path.join(GENERIC_THUMBNAILS_FOLDER))
    await fsx.copy(GENERIC_THUMBNAILS_SOURCE_FOLDER, GENERIC_THUMBNAILS_FOLDER)
  } catch {
    console.log('\nProblem creating FILES folder\n')
  }

  // If localisation folder is missing, we assume it's a fresh install and
  // fetch them (and preferences) from core templates
  try {
    if (
      !(await fsx.pathExists(LOCALISATION_FOLDER)) ||
      !(await fsx.pathExists(path.join(LOCALISATION_FOLDER, 'languages.json')))
    ) {
      makeFolder(LOCALISATION_FOLDER, 'Restoring LOCALISATIONS and PREFERENCES')
      await fsx.copy(path.join(BASE_SNAPSHOT_FOLDER, 'localisation'), LOCALISATION_FOLDER)
      await fsx.copy(
        path.join(BASE_SNAPSHOT_FOLDER, PREFERENCES_FILE_NAME),
        path.join(PREFERENCES_FOLDER, PREFERENCES_FILE_NAME)
      )
    }
  } catch {
    console.log('\nProblem restoring LOCALISATIONS or PREFS\n')
  }
}
