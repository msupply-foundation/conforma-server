import takeSnapshot from '../src/components/exportAndImport/takeSnapshot'
import useSnapshot from '../src/components/exportAndImport/useSnapshot'
import {
  DEFAULT_SNAPSHOT_NAME,
  DEFAULT_OPTIONS_NAME,
} from '../src/components/exportAndImport/constants'

/* Note: this file should have the same relative path route to `database` as server (i.e. ../database) */

const printUsageMessageAndQuit = (isError = true) => {
  console.log('parameters: take|use|--help [--options <options-json-name>] [<snapshot-name>]')

  console.log(`default: <options-json-name> = ${DEFAULT_OPTIONS_NAME}`)
  console.log(`default: <snapshot-name>] = ${DEFAULT_SNAPSHOT_NAME}`)
  process.exit(isError ? 1 : 0)
}

const getParameter = (parameterName: string, isBooleanParameter = false) => {
  const index = process.argv.indexOf(parameterName)
  if (index < 0) return { isLastParameter: false, value: undefined }

  if (isBooleanParameter)
    return { isLastParameter: index + 1 === process.argv.length, value: process.argv[index] }

  if (index + 1 >= process.argv.length) {
    console.log(parameterName + ' should be followed by value')
    printUsageMessageAndQuit()
  }

  return { isLastParameter: index + 2 === process.argv.length, value: process.argv[index + 1] }
}

const getSnapshotName = (lastParameterAlreadyRead: boolean) => {
  if (lastParameterAlreadyRead) return undefined
  if (process.argv.length <= 4) return undefined

  return process.argv[process.argv.length - 1]
}

const doOperation = async () => {
  if (getParameter('--help', true).value) printUsageMessageAndQuit(false)

  const isTake = process.argv[2] === 'take'
  const isUse = process.argv[2] === 'use'

  const profilePrameterResult = getParameter('--profile')

  const snapshotName = getSnapshotName(profilePrameterResult.isLastParameter)
  console.log(process.argv.length)
  if (!isTake && !isUse) printUsageMessageAndQuit()

  if (isTake) {
    console.log(await takeSnapshot({ snapshotName, optionsName: profilePrameterResult.value }))
  }

  if (isUse) {
    console.log(await useSnapshot({ snapshotName, optionsName: profilePrameterResult.value }))
  }

  process.exit(0)
}

doOperation()
