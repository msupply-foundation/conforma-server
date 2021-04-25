const fs = require('fs')
const path = require('path')
const { takeSnapshot } = require('./takeSnapshot.js')
const { useSnapshot } = require('./useSnapshot.js')
const { config } = require('./defaultConfig.js')

const printUsageMessageAndQuit = (isError = true) => {
  console.log(
    'parameters: take|use|--help [--files] [--exclude-timestamps] [--profile <definition-name>] [<snapshot-name>]'
  )
  console.log('default: <definition-file-name> = default')
  console.log('default: <snapshot-name>] = current')
  process.exit(isError ? 1 : 0)
}

const getParameter = (parameterName, isBoolean) => {
  const index = process.argv.indexOf(parameterName)
  if (index < 0) return { isLastParameter: false, value: undefined }

  if (isBoolean)
    return { isLastParameter: index + 1 === process.argv.length, value: process.argv[index] }

  if (index + 1 >= process.argv.length) {
    console.log(argumentName + ' should be followed by value')
    printUsageMessageAndQuit()
  }

  return { isLastParameter: index + 2 === process.argv.length, value: process.argv[index + 1] }
}

const fromParametersToConfig = (config) => {
  if (getParameter('--help', true).value) printUsageMessageAndQuit(0)

  const includeFilesResult = getParameter('--files', true)
  config.includeFiles = !!includeFilesResult.value

  const excludeTimestampsResult = getParameter('--exclude-timestamps', true)
  config.includeTimestamps = !excludeTimestampsResult.value

  const profileResult = getParameter('--profile', false)
  const profileName = profileResult.value
  if (profileName) config.profileName = profileName

  const snapshotNameProvided =
    !includeFilesResult.isLastParameter &&
    !excludeTimestampsResult.isLastParameter &&
    !profileResult.isLastParameter &&
    process.argv.length > 3
  if (snapshotNameProvided) config.snapshotName = process.argv[process.argv.length - 1]

  return config
}

const addProfile = (config) => {
  let fullProfileLocation = path.join(config.profileLocation, config.profileName + '.json')
  try {
    config.profile = JSON.parse(fs.readFileSync(fullProfileLocation))
  } catch (e) {
    console.log(
      'problem loading profile ' + config.profileName + ' full path ' + fullProfileLocation
    )
    console.log('\n\n\n' + e)
    process.exit(1)
  }
  if (config.includeFiles) {
    const filesTableProfile = config.profile.definitions.find(({ table }) => table == 'file')
    if (filesTableProfile) filesTableProfile.skip = false
    else config.profile.definitions.push({ table: 'file' })
  }

  return config
}

const newConfig = addProfile(fromParametersToConfig(config))

if (process.argv[2] === 'use') useSnapshot(newConfig)
else if (process.argv[2] === 'take') takeSnapshot(newConfig)
else {
  console.log('first parameters must be either take or use')
  printUsageMessageAndQuit()
}
