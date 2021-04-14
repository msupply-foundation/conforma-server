const fs = require('fs')
const { exec } = require('child_process')
// should run from root folder yarn scripts
const pluginsFolder = './plugins/'

const plugins = fs
  .readdirSync(pluginsFolder)
  .map((pluginName) => ({ fullPluginFolder: pluginsFolder + pluginName, pluginName }))
  .filter(({ fullPluginFolder }) => fs.lstatSync(fullPluginFolder).isDirectory())

console.log('running yarn install for plugins')

const command = 'yarn install'
plugins.forEach((plugin) => {
  const { fullPluginFolder, pluginName } = plugin
  console.log('running yarn install for ' + pluginName + ' ... ')

  const options = { cwd: fullPluginFolder }
  const childProcess = exec(command, options, (error, _, stderr) => {
    if (error) return console.error(error)
    if (stderr) console.error(stderr)
  })
  childProcess.on('close', (code) => {
    if (code !== 0) {
      console.log('running yarn install for ' + pluginName + ' ... error, exited with code ' + code)
      console.log('go to ' + pluginName + ' folder and run yarn install to diagnose')
    } else console.log('running yarn install for ' + pluginName + ' ... done')
  })
})
