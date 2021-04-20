const { spawn } = require('child_process')

// should be called from withing plugin directory
const workingDir = process.cwd().split('/')

const pluginName = workingDir[workingDir.length - 1]
const rootDirectory = __dirname + '/../../'

const command = ['yarn', ['test', pluginName], { cwd: rootDirectory, stdio: 'inherit' }]
console.log('executing: ')
console.log(JSON.stringify(command, null, ' '))

const yarnTest = spawn(...command)

yarnTest.on('close', process.exit)
