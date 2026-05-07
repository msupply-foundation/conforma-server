require('dotenv').config()
import readlineSync from 'readline-sync'
import { writeFileSync } from 'fs'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'

const exec = promisify(execCallback)
const FRONT_END_PATH = process.env.FRONT_END_PATH

const releaseTypes = [
  '--prerelease',
  '--patch',
  '--minor',
  '--major',
  '--preminor',
  '--premajor',
  '--prepatch',
] as const
type ReleaseType = (typeof releaseTypes)[number]

const release = async () => {
  if (!FRONT_END_PATH) exitWithError('No front-end repo path in .env file')

  const releaseType: ReleaseType = (process.argv[2] || '--prerelease') as ReleaseType

  if (!releaseTypes.includes(releaseType))
    exitWithError(`❌ Invalid release type "${releaseType}".
Usage: yarn release <version_type>
Valid types: ${releaseTypes.join(', ')}`)

  const branch = await getGitBranch()
  if (!branch) exitWithError('Invalid git branch')

  console.log(
    `\nYou are about to create a new version of type: ${releaseType} on branch ${branch}\nPlease ensure you have added the front-end file path to your .env file and the front-end has the correct branch checked out.\n\nAre you sure you wish to proceed?`
  )

  if (!(await userRespondsYes())) process.exit(0)

  try {
    console.log(`🚀 Bumping version with: yarn version ${releaseType}`)
    await exec(`yarn version ${releaseType}`)
  } catch (error) {
    exitWithError(`Error bumping version: ${error}`)
  }

  const pkg = require('../package.json')
  const tag = `v${pkg.version}`
  console.log(`\nServer version bumped to: ${tag}\n`)
  console.log(`\nPushing tag ${tag} to GitHub...`)
  try {
    await exec(`git push origin ${tag}`)
  } catch {
    exitWithError('Problem pushing tag!')
  }

  console.log('Done!\n')

  console.log('\nSwitching to front-end repo and doing the same...')
  console.log(`Tagging front-end with: ${tag}\n`)

  try {
    await exec(
      `cd ${FRONT_END_PATH} && yarn version --new-version ${pkg.version} && git push origin ${tag}`
    )
  } catch {
    exitWithError('Problem creating front-end version')
  }
  console.log('Done!\n')

  console.log(`Would you like to start a Docker build for version ${pkg.version}?`)

  if (userRespondsYes()) {
    return tag
  }
  return ''
}

release().then((tag) => {
  writeFileSync('tag', tag) // To be used by shell script
})

function exitWithError(error: string) {
  console.log(`\nERROR: ${error}\n`)
  process.exit(1)
}

async function getGitBranch() {
  const { stdout } = await exec(`git status`)
  return /On branch (.+)/gm.exec(stdout)?.[1] || ''
}

function userRespondsYes(prompt: string = '(Y/n)? ') {
  const answer = readlineSync.question(prompt)
  return answer.includes('Y') || answer.includes('y')
}
