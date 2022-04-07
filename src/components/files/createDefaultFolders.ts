// Creates (and populates if appropriate) the folders that are not saved as part
// of git repo. We run this for safety when starting the server, or before
// saving or loading a snapshot.

import {
  PREFERENCES_FOLDER,
  PREFERENCES_FILE_NAME,
  LOCALISATION_FOLDER,
  FILES_FOLDER,
  SNAPSHOT_FOLDER,
  BASE_SNAPSHOT_FOLDER,
  GENERIC_THUMBNAILS_FOLDER,
  GENERIC_THUMBNAILS_SOURCE_FOLDER,
  DATABASE_FOLDER,
  BASE_SNAPSHOT_NAME,
} from '../../constants'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { makeFolder } from '../utilityFunctions'

export function createDefaultDataFolders() {
  try {
    console.log('Creating SNAPSHOTS folder')
    makeFolder(SNAPSHOT_FOLDER)
    // Copy core_templates to snapshots folder
    execSync(`cp -r '${DATABASE_FOLDER}/${BASE_SNAPSHOT_NAME}' '${SNAPSHOT_FOLDER}'`)
  } catch {
    console.log('\nProblem creating SNAPSHOTS folder\n')
  }

  try {
    console.log('Creating FILES folder')
    makeFolder(FILES_FOLDER)
    // Restore generic thumbnails, they get wiped out during snapshot loading
    makeFolder(path.join(GENERIC_THUMBNAILS_FOLDER))
    execSync(`cp -r '${GENERIC_THUMBNAILS_SOURCE_FOLDER}/.' '${GENERIC_THUMBNAILS_FOLDER}'`)
  } catch {
    console.log('\nProblem creating FILES folder\n')
  }

  // If localisation folder is missing, we assume it's a fresh install and
  // fetch them (and preferences) from core templates
  try {
    console.log('Restoring LOCALISATIONS and PREFERENCES')
    if (
      !fs.existsSync(LOCALISATION_FOLDER) ||
      !fs.existsSync(path.join(LOCALISATION_FOLDER, 'languages.json'))
    ) {
      makeFolder(LOCALISATION_FOLDER)
      execSync(`cp -r '${BASE_SNAPSHOT_FOLDER}/localisation/.' '${LOCALISATION_FOLDER}'`)
      execSync(`cp '${BASE_SNAPSHOT_FOLDER}/${PREFERENCES_FILE_NAME}' '${PREFERENCES_FOLDER}'`)
    }
  } catch {
    console.log('\nProblem restoring LOCALISATIONS or PREFS\n')
  }
}
