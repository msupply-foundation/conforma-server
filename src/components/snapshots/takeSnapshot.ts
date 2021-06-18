import fs from 'fs/promises'
import fsSync from 'fs'
import { ExportAndImportOptions, SnapshotOperation } from '../exportAndImport/types'
import path from 'path'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import getRecordsAsObject from '../exportAndImport/exportToJson'
import { promisify } from 'util'
import zipper from 'adm-zip'
import pgDiffConfig from './pgDiffConfig.json'
import {
  DEFAULT_SNAPSHOT_NAME,
  DEFAULT_OPTIONS_NAME,
  SNAPSHOT_FILE_NAME,
  OPTIONS_FILE_NAME,
  PG_DIFF_CONFIG_FILE_NAME,
  PG_SCHEMA_DIFF_FILE_NAME,
  ROOT_FOLDER,
  SNAPSHOT_FOLDER,
  SNAPSHOT_OPTIONS_FOLDER,
  FILES_FOLDER,
} from './constants'
const asyncRimRaf = promisify(rimraf)

const takeSnapshot: SnapshotOperation = async ({
  snapshotName = DEFAULT_SNAPSHOT_NAME,
  optionsName = DEFAULT_OPTIONS_NAME,
  options: inOptions,
}) => {
  try {
    console.log(`taking snapshot, name: ${snapshotName}`)

    const options = await getOptions(optionsName, inOptions)
    const snapshotObject = await getRecordsAsObject(options)

    const newSnapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)
    // Remove and create snapshot folder
    await asyncRimRaf(newSnapshotFolder)
    execSync(`mkdir ${newSnapshotFolder}`)

    // Write snapshot and config to folder
    await fs.writeFile(
      path.join(newSnapshotFolder, `${SNAPSHOT_FILE_NAME}.json`),
      JSON.stringify(snapshotObject, null, ' ')
    )

    await fs.writeFile(
      path.join(newSnapshotFolder, `${OPTIONS_FILE_NAME}.json`),
      JSON.stringify(options, null, ' ')
    )

    await getScheamDiff(newSnapshotFolder)

    copyFiles(newSnapshotFolder, options)

    await zipSnapshot(newSnapshotFolder, snapshotName)

    return { success: true, message: `created snapshot ${snapshotName}` }
  } catch (e) {
    return { success: false, message: 'error while taking snapshot', error: e.toString() }
  }
}

const getOptions = async (optionsName?: string, options?: ExportAndImportOptions) => {
  if (options) {
    console.log('use options passed as a parameter')
    return options
  }

  const optionsFile = path.join(SNAPSHOT_OPTIONS_FOLDER, `${optionsName}.json`)

  console.log(`using options from: ${optionsFile}`)
  const optionsRaw = await fs.readFile(optionsFile, {
    encoding: 'utf-8',
  })

  return JSON.parse(optionsRaw) as ExportAndImportOptions
}

const zipSnapshot = async (snapshotFolder: string, snapshotName: string) => {
  const zip = new zipper()
  zip.addLocalFolder(snapshotFolder)

  await new Promise((resolve, reject) =>
    zip.writeZip(path.join(SNAPSHOT_FOLDER, `${snapshotName}.zip`), (error) => {
      if (error) return reject(error)
      resolve('done')
    })
  )
}

const getScheamDiff = async (newSnapshotFolder: string) => {
  console.log('creating schema diff ... ')
  // Creating db to compare to
  execSync('./database/initialise_database.sh tmf_app_manager_temp', { cwd: ROOT_FOLDER })

  // Changing pgDiff configuration output to new snapshot directory
  pgDiffConfig.development.compareOptions.outputDirectory = newSnapshotFolder

  await fs.writeFile(
    path.join(ROOT_FOLDER, `${PG_DIFF_CONFIG_FILE_NAME}.json`),
    JSON.stringify(pgDiffConfig, null, ' ')
  )

  // Running diff command
  execSync('node node_modules/pg-diff-cli/main.js -c development initial-script', {
    cwd: ROOT_FOLDER,
  })
  // Rename diff file

  const diffFile = fsSync.readdirSync(newSnapshotFolder).find((file) => file.endsWith('.sql'))
  if (!diffFile) return

  fsSync.renameSync(
    path.join(newSnapshotFolder, diffFile),
    path.join(newSnapshotFolder, `${PG_SCHEMA_DIFF_FILE_NAME}.sql`)
  )

  console.log('creating schema diff ... done ')
}

const copyFiles = (
  newSnapshotFolder: string,
  { includeTables, excludeTables }: ExportAndImportOptions
) => {
  if (
    (includeTables.includes('file') || includeTables.length === 0) &&
    !excludeTables.includes('file')
  ) {
    console.log('copying files ...')
    execSync(`cp -R ${FILES_FOLDER} ${newSnapshotFolder}`)
    console.log('copying files ... done')
  }
}

export default takeSnapshot
