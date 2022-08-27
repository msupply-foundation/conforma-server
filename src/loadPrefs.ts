/*
Script to ensure preferences are present before server loads. Checks for /preferences/preferences.json and if not present copies it from core_templates.

Called by nodemon before launching server.ts
*/
import fs from 'fs'
import { execSync } from 'child_process'
import { makeFolder } from './components/utilityFunctions'

try {
  if (!fs.existsSync('preferences') || !fs.existsSync('preferences/preferences.json')) {
    makeFolder('preferences', 'Restoring default preferences...\n')
    execSync('cp database/core_templates/preferences.json preferences')
  }
} catch {
  console.log('\nProblem restoring default preferences\n')
  process.exit(1)
}
