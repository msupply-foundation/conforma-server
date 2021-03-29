const fs = require('fs')
const { graphQLdefinition } = require('./graphQLdefinitions.js')
const { executeGraphQLQuery } = require('./insertData.js')
const { updateRowPolicies } = require('./updateRowPolicies.js')

const { execSync } = require('child_process')
const snapshotNameFile = './database/snapshots/currentSnapshot.txt'

console.log('initialising database ... ')

execSync('./database/initialise_database.sh')

console.log('initialising database ... done')

const useSnapshot = async () => {
  let snapshotName = process.argv[2]
  const previousSnapshotName = fs.readFileSync(snapshotNameFile, 'utf-8')
  if (!snapshotName) snapshotName = previousSnapshotName

  const snapshotFolder = './database/snapshots/' + snapshotName + '/'

  console.log('inserting from snapshot: ' + snapshotName)
  for (let definition of graphQLdefinition) {
    if (definition.skip) continue

    const currentTableFolder = snapshotFolder + definition.table

    console.log('inserting ' + definition.table + ' ...')
    const filesToProcess = fs.readdirSync(currentTableFolder).filter((file) => !file.match(/^\./)) // Ignore hidden files

    sortedFilesToProcess = sortFiles(filesToProcess)
    for (filename of filesToProcess) await insertDataFromFile(currentTableFolder + '/' + filename)
    console.log('inserting ' + definition.table + ' ... done')
  }
  await updateRowPolicies()

  console.log('running post data insert ... ')
  execSync('./database/post_data_insert.sh')
  console.log('running post data insert ... done')

  console.log('all ... done')
}

const insertDataFromFile = async (filename) => {
  const content = fs.readFileSync(filename, 'utf-8')

  console.log(content)
  await executeGraphQLQuery(content)
}

const sortFiles = (files) => {
  files.sort((file1, file2) => extractId(file1) - extractId(file2))
}

const extractId = (file) => {
  let index = file.indexOf('_')
  if (index <= 0) index = file.indexOf('.')

  return Number(file.slice(0, index))
}

useSnapshot()
