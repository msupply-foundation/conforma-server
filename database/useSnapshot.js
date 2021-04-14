const fs = require('fs')
const { executeGraphQLQuery } = require('./insertData.js')
const { updateRowPolicies } = require('./updateRowPolicies.js')

const seperator = '########### MUTATION END ###########'
const { execSync } = require('child_process')
const snapshotNameFile = './database/snapshots/currentSnapshot.txt'

console.log('initialising database ... ')
execSync('./database/initialise_database.sh')
console.log('initialising database ... done')

const useSnapshot = async () => {
  let snapshotName = process.argv[2]
  const previousSnapshotName = fs.readFileSync(snapshotNameFile, 'utf-8')
  if (!snapshotName) snapshotName = previousSnapshotName

  const snapshotFileName = './database/snapshots/' + snapshotName + '.graphql'

  console.log('inserting from snapshot: ' + snapshotName)

  await insertDataFromFile(snapshotFileName)

  await updateRowPolicies()

  console.log('running post data insert ... ')
  execSync('./database/post_data_insert.sh')
  console.log('running post data insert ... done')

  console.log('all ... done')
}

const insertDataFromFile = async (filename) => {
  const wholeFileContent = fs.readFileSync(filename, 'utf-8')

  const splitContent = wholeFileContent.split(seperator)

  for (let content of splitContent) {
    // console.log(content) // uncomment for debugging
    try {
      await executeGraphQLQuery(content)
    } catch (e) {
      console.log('### error while inserting: ' + content)
      throw e
    }
  }
}

useSnapshot()
