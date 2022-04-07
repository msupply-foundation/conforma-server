// The first time the server loads, we want to populate prefs, files, snapshots
// and localisation with default content from core_templates

import {
  PREFERENCES_FOLDER,
  PREFERENCES_FILE,
  LOCALISATION_FOLDER,
  FILES_FOLDER,
  SNAPSHOT_FOLDER,
  BASE_SNAPSHOT_FOLDER,
} from '../../constants'
import fs from 'fs'
import { execSync } from 'child_process'
import { makeFolder } from '../utilityFunctions'

export function createDefaultDataFolders() {
  makeFolder(SNAPSHOT_FOLDER)
  makeFolder(FILES_FOLDER)
  if (!fs.existsSync(LOCALISATION_FOLDER)) {
    makeFolder(LOCALISATION_FOLDER)
    execSync(`cp -r '${BASE_SNAPSHOT_FOLDER}/localisation/.' '${LOCALISATION_FOLDER}'`)
    execSync(`cp '${PREFERENCES_FILE}' '${PREFERENCES_FOLDER}'`)
  }
}
