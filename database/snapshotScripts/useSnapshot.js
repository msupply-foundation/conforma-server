const fs = require('fs')
const path = require('path')
const { copyFolder, removeFolder, createFolder } = require('./helpers.js')
const { executeGraphQLQuery, updateRowPolicies, insertCoreData } = require('../helpers.js')
const { config } = require('./defaultConfig.js')

const seperator = '########### MUTATION END ###########'
const { execSync } = require('child_process')

const useSnapshot = async ({
  snapshotName,
  snapshotFilesFolder,
  snapshotsRootDir,
  filesLocation,
} = config) => {
  const snapshotLocation = path.join(snapshotsRootDir, snapshotName)
  const useSnapshotConfigLocation = path.join(snapshotLocation, 'useSnapshotConfig.json')
  const snapshotFilesLocation = path.join(snapshotLocation, snapshotFilesFolder)

  console.log('reading config for: ' + snapshotName)
  const { initialiseDB, insertCoreData: shouldInsertCoreData, ignoreInsertDataFiles } = JSON.parse(
    fs.readFileSync(useSnapshotConfigLocation)
  )

  if (initialiseDB) {
    console.log('initialising database ... ')
    execSync('./database/initialise_database.sh')
    console.log('initialising database ... done')
  }

  if (shouldInsertCoreData) {
    console.log('inserting core data ... ')
    await insertCoreData(ignoreInsertDataFiles || [])
    console.log('inserting core data ... done ')
  }

  console.log('inserting from snapshot: ' + snapshotName)
  const snapshotFileName = path.join(snapshotsRootDir, snapshotName, 'mutation.graphql')
  await insertDataFromFile(snapshotFileName)
  console.log('inserting from snapshot ... done')

  if (fs.existsSync(snapshotFilesLocation)) {
    console.log('copying files from snapshot ...')
    removeFolder(filesLocation)
    createFolder(filesLocation)
    copyFolder(snapshotFilesLocation, filesLocation)
    console.log('copying files from snapshot ... done')
  }

  await updateRowPolicies()

  console.log('running post data insert ... ')
  execSync('./database/post_data_insert.sh')
  console.log('running post data insert ... done')

  console.log('running serial update ... ')
  execSync('./database/update_serials.sh')
  console.log('running serial update ... done')

  console.log('all ... done')
}

const insertDataFromFile = async (filename) => {
  // TODO make it a stream
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

exports.useSnapshot = useSnapshot
