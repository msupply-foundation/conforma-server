const fs = require('fs')
const { execSync } = require('child_process')
const json = require('comment-json')
const removeDir = require('rimraf')
const { promisify } = require('util')
const path = require('path')

const asyncRemoveDir = promisify(removeDir)

const tempConfigFilename = 'tempBuildTsConfig.json'
const rootDirectory = __dirname + '/../..'

const buildPlugin = async (pluginName) => {
  const pluginFolder = rootDirectory + '/plugins/' + pluginName
  if (!fs.existsSync(path.join(pluginFolder, 'package.json'))) {
    console.log('no package.json: ' + pluginName)
    return
  }

  const temporaryPluginBuildFolder = rootDirectory + '/temporaryPluginBuild'

  const yarnInstallAndPrep = async () => {
    execSync('yarn install', { cwd: pluginFolder })
    await asyncRemoveDir(temporaryPluginBuildFolder)
  }

  const tempConfigPath = `${rootDirectory}/${tempConfigFilename}`
  const createTypescriptJson = () => {
    const tsconfig = json.parse(fs.readFileSync(rootDirectory + '/tsconfig.json', 'utf-8'))
    tsconfig.compilerOptions.rootDir = './'
    tsconfig.compilerOptions.outDir = temporaryPluginBuildFolder
    tsconfig.exclude = undefined
    tsconfig.include = [pluginFolder + '/src']
    fs.writeFileSync(tempConfigPath, JSON.stringify(tsconfig))
  }

  const build = () => {
    execSync('yarn tsc --project ' + tempConfigPath, { cwd: rootDirectory, stdio: 'inherit' })
  }

  const buildFolder = pluginFolder + '/build/'

  const prepareToCopy = async () => {
    await asyncRemoveDir(buildFolder)
    try {
      fs.mkdirSync(buildFolder)
    } catch {}
  }

  const finalBuildFolder = buildFolder + pluginName

  const pluginSource = temporaryPluginBuildFolder + '/plugins/' + pluginName
  const pluginNodeModulesFolder = pluginFolder + '/node_modules'
  const pluginJson = pluginFolder + '/plugin.json'

  const copyToFinalBuildFolder = () => {
    const copyPluginSource = 'cp -R ' + pluginSource + ' ' + finalBuildFolder
    execSync(copyPluginSource, { cwd: rootDirectory })

    const copyNodeModulesCommand = 'cp -R ' + pluginNodeModulesFolder + ' ' + finalBuildFolder + '/'
    execSync(copyNodeModulesCommand, { cwd: rootDirectory })

    const copyPluginJsonCommand = 'cp -R ' + pluginJson + ' ' + finalBuildFolder + '/'
    execSync(copyPluginJsonCommand, { cwd: rootDirectory })
  }

  const cleanUp = async () => {
    await asyncRemoveDir(temporaryPluginBuildFolder)
    fs.unlinkSync(tempConfigPath)
  }

  console.log('building plugin ' + pluginName + ' ... ')
  await yarnInstallAndPrep()
  createTypescriptJson()
  build()
  await prepareToCopy()
  copyToFinalBuildFolder()
  await cleanUp()

  console.log('finished building plugin ' + pluginName + ' ... done')
  return finalBuildFolder
}

exports.buildPlugin = buildPlugin
