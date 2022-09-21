/*
Script to ensure preferences are present before server loads. Checks for
/preferences/preferences.json and if not present copies it from core_templates.

Called by nodemon before launching server.ts and as part of build script.
*/
import fs from 'fs'
import { execSync } from 'child_process'

// This function exists in `utilityFunctions.ts`, but we can't import it from
// there in this script, otherwise this script fails due to `utilityFunctions`
// calling "config", which requires preferences to already exist.
const makeFolder = (folderPath: string, message?: string) => {
  if (!fs.existsSync(folderPath)) {
    message && console.log(message)
    fs.mkdirSync(folderPath)
  }
}

try {
  if (!fs.existsSync('preferences') || !fs.existsSync('preferences/preferences.json')) {
    makeFolder('preferences', 'Restoring default preferences...\n')
    execSync('cp database/core_templates/preferences.json preferences')
  }
} catch {
  console.log('\nProblem restoring default preferences\n')
  process.exit(1)
}
