const { execSync } = require('child_process')

const removeFolder = (folderName) => {
  try {
    execSync('rm -rf ' + folderName)
  } catch (e) {}
}

const createFolder = (folderName) => {
  try {
    execSync('mkdir ' + folderName)
  } catch (e) {}
}

const copyFolder = (fromFolder, toFolder) => {
  execSync('cp -r ' + fromFolder + '/.' + ' ' + toFolder)
}

const prettifyMutations = (folderName) => {
  execSync('npx prettier --write "' + folderName + '"')
}

exports.copyFolder = copyFolder
exports.createFolder = createFolder
exports.removeFolder = removeFolder
exports.prettifyMutations = prettifyMutations
