const fetch = require('node-fetch')
const fs = require('fs')
const rimraf = require('rimraf')
const { promisify } = require('util')
const { graphQLdefinition, defaultGenerateFileName } = require('./graphQLdefinitions.js')
const { executeGraphQLQuery } = require('./insertData.js')
const { updateRowPolicies } = require('./updateRowPolicies.js')

const { execSync } = require('child_process')

const { graphQLdefinition, defaultGenerateFileName } = require('./graphQLdefinitions.js')

console.log('initialising database ... ')

execSync('./database/initialise_database.sh')

console.log('initialising database ... done')

const useSnapshot = async () => {
  let snapshotName = process.argv[2]
  const previousSnapshotName = fs.readFileSync(snapshotNameFile, 'utf-8')
  if (!snapshotName) snapshotName = previousSnapshotName

  console.log('inserting from from snapshot: ' + snapshotName)
  for (let definition of graphQLdefinition) {
    if (definitions.skip) return

    console.log('inserting ' + definition.table + ' ...')
    const filesToProcess = fs
      .readdirSync('./database/' + snapshotName + '/' + definition.table)
      .filter((file) => !file.match(/^\./)) // Ignore hidden files

    for (filename of filesToProcess) await insertDataFromFile(filename)
    console.log('inserting ' + definition.table + ' ... done')
  }
  await updateRowPolicies()

  console.log('all ... done')
}

const insertDataFromFile = async (filename) => {
  const content = fs.readFileSync(filename, 'utf-8')
  await executeGraphQLQuery(content)
}
