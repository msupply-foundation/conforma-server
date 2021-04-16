const { buildPlugin } = require('./buildPlugin.js')

// should be called from withing plugin directory
const workingDir = process.cwd().split('/')

const pluginName = workingDir[workingDir.length - 1]

buildPlugin(pluginName)
