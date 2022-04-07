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
  makeFolder(SNAPSHOT_FOLDER)
  makeFolder(FILES_FOLDER)

  // Restore generic thumbnails, they sometimes get wiped out during snapshot
  // loading
  makeFolder(path.join(GENERIC_THUMBNAILS_FOLDER))
  execSync(`cp -r '${GENERIC_THUMBNAILS_SOURCE_FOLDER}/.' '${GENERIC_THUMBNAILS_FOLDER}'`)

  // If localisations folder is missing, we assume it's a fresh install and
  // fetch them (and preferences) from core templates
  if (!fs.existsSync(LOCALISATION_FOLDER)) {
    makeFolder(LOCALISATION_FOLDER)
    execSync(`cp -r '${BASE_SNAPSHOT_FOLDER}/localisation/.' '${LOCALISATION_FOLDER}'`)
    execSync(`cp '${BASE_SNAPSHOT_FOLDER}/${PREFERENCES_FILE_NAME}' '${PREFERENCES_FOLDER}'`)
  }
}
