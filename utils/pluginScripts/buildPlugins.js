const fs = require('fs')
const { execSync } = require('child_process')

const pluginsFolder = './plugins/'
const pluginsBuiltFolder = './build/plugins/'
const { buildPlugin } = require('./buildPlugin.js')

const rootDirectory = __dirname + '/../../'

const buildPlugins = async () => {
  const plugins = fs
    .readdirSync(pluginsFolder)
    .map((pluginName) => ({ fullPluginFolder: pluginsFolder + pluginName, pluginName }))
    .filter(({ fullPluginFolder }) => fs.lstatSync(fullPluginFolder).isDirectory())

  console.log('building all plugins')

  execSync('rm -Rf ./build/plugins/*/', { cwd: rootDirectory })

  try {
    fs.mkdirSync(pluginsBuiltFolder)
  } catch {}

  for (let plugin of plugins) {
    const { pluginName } = plugin

    const pluginBuiltFolder = await buildPlugin(pluginName)

    console.log('copying plugin to overall build ' + pluginName + ' ...')
    execSync('cp -R ' + pluginBuiltFolder + ' ' + pluginsBuiltFolder + '/', { cwd: rootDirectory })
    console.log('copying plugin to overall build ' + pluginName + ' ... done')
  }
}

buildPlugins()
