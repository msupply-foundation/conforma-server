// The first time the server loads, we want to populate prefs, files, snapshots
// and localisation with default content from core_templates

import {
  PREFERENCES_FOLDER,
  PREFERENCES_FILE_NAME,
  LOCALISATION_FOLDER,
  FILES_FOLDER,
  SNAPSHOT_FOLDER,
  BASE_SNAPSHOT_FOLDER,
  GENERIC_THUMBNAILS_FOLDER,
  GENERIC_THUMBNAILS_SOURCE_FOLDER,
} from '../../constants'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { makeFolder } from '../utilityFunctions'

export function createDefaultDataFolders() {
  try {
    makeFolder(SNAPSHOT_FOLDER)
  } catch {
    console.log('\nProblem creating SNAPSHOTS folder\n')
  }
  try {
    makeFolder(FILES_FOLDER)
    // Restore generic thumbnails, they sometimes get wiped out during snapshot
    // loading
    makeFolder(path.join(GENERIC_THUMBNAILS_FOLDER))
    execSync(`cp -r '${GENERIC_THUMBNAILS_SOURCE_FOLDER}/.' '${GENERIC_THUMBNAILS_FOLDER}'`)
  } catch {
    console.log('\nProblem creating FILES folder\n')
  }

  // If localisation folder is missing, we assume it's a fresh install and
  // fetch them (and preferences) from core templates
  try {
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
