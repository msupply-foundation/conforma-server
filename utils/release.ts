require('dotenv').config()
import readlineSync from 'readline-sync'
import { existsSync } from 'fs'
import { promisify } from 'util'
import { exec as execCallback, spawn } from 'child_process'

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

const validTypeNames = releaseTypes.map((t) => t.replace(/^--/, '')).join(', ')

const release = async () => {
  if (!FRONT_END_PATH) exitWithError('No front-end repo path in .env file')

  const input = process.argv[2]
  if (!input)
    exitWithError(`Missing version bump type.
Usage: yarn release <version_type>
Valid types: ${validTypeNames}`)

  // Accept "patch" or "--patch" — strip leading dashes before validating.
  const trimmed = input.replace(/^--?/, '')
  const releaseType = `--${trimmed}` as ReleaseType
  if (!releaseTypes.includes(releaseType))
    exitWithError(`Invalid release type "${input}".
Usage: yarn release <version_type>
Valid types: ${validTypeNames}`)

  const branch = await getGitBranch()
  if (!branch) exitWithError('Invalid git branch')

  const { stdout: dirty } = await exec(`git status --porcelain`)
  if (dirty.trim())
    exitWithError(
      `Server working tree has uncommitted changes — please commit or stash before running a release:\n${dirty}`
    )

  // Front-end pre-flight: catch problems before bumping anything, so we never
  // half-tag a release.
  if (!existsSync(FRONT_END_PATH))
    exitWithError(`Front-end path does not exist: ${FRONT_END_PATH}`)

  const { stdout: frontDirty } = await exec(`git status --porcelain`, { cwd: FRONT_END_PATH })
  if (frontDirty.trim())
    exitWithError(
      `Front-end working tree has uncommitted changes — please commit or stash before running a release:\n${frontDirty}`
    )

  const frontBranch = await getGitBranch(FRONT_END_PATH)
  if (!frontBranch) exitWithError('Could not determine front-end branch')
  if (frontBranch !== branch)
    exitWithError(
      `Branch mismatch — server is on "${branch}" but front-end is on "${frontBranch}". Please check out matching branches before releasing.`
    )

  // Bump server package.json without committing/tagging yet, so the user can
  // see the resulting version and confirm before it's locked in.
  try {
    await exec(`yarn version ${releaseType} --no-git-tag-version`)
  } catch (error) {
    exitWithError(`Error bumping version: ${error}`)
  }

  const pkg = require('../package.json')
  const tag = `v${pkg.version}`

  console.log(
    `\nYou are about to create a new version of type: ${releaseType} (${tag}) on branch ${branch}\nServer and front-end ("${FRONT_END_PATH}") will both be tagged.\n\nAre you sure you wish to proceed?`
  )

  if (!userRespondsYes()) {
    console.log('Aborted — reverting package.json.')
    await exec(`git checkout -- package.json`)
    process.exit(0)
  }

  console.log(`\nServer version bumped to: ${tag}\n`)

  // Commit + tag both repos locally first; only push tags once both are
  // consistent, so a front-end failure can't strand a pushed server tag.
  try {
    await exec(`git add package.json`)
    await exec(`git commit -m ${tag}`)
    await exec(`git tag ${tag}`)
  } catch (error) {
    exitWithError(`Error committing server version: ${error}`)
  }

  console.log(`Bumping and tagging front-end...`)
  try {
    await exec(`yarn version --new-version ${pkg.version} --no-git-tag-version`, {
      cwd: FRONT_END_PATH,
    })
    await exec(`git add package.json`, { cwd: FRONT_END_PATH })
    await exec(`git commit -m ${tag}`, { cwd: FRONT_END_PATH })
    await exec(`git tag ${tag}`, { cwd: FRONT_END_PATH })
  } catch (error) {
    exitWithError(`Error tagging front-end: ${error}`)
  }

  // Push tags only — bump commits stay local so the user can review/group
  // them with other work before pushing the branch.
  console.log(`\nPushing tag ${tag} to GitHub (server then front-end)...`)
  try {
    await exec(`git push origin ${tag}`)
    await exec(`git push origin ${tag}`, { cwd: FRONT_END_PATH })
  } catch (error) {
    exitWithError(`Problem pushing tag: ${error}`)
  }

  console.log('Done!\n')

  console.log(`Would you like to start a Docker build for version ${pkg.version}?`)
  if (!userRespondsYes()) process.exit(0)

  await runDockerise(tag)
}

release().catch((err) => {
  console.error('\nERROR:', err)
  process.exit(1)
})

function runDockerise(tag: string): Promise<void> {
  return new Promise((resolve) => {
    const child = spawn('./dockerise.sh', [tag, 'push'], { cwd: 'docker', stdio: 'inherit' })
    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(`\nDocker build failed with exit code ${code}`)
        process.exit(code ?? 1)
      }
      resolve()
    })
  })
}

function exitWithError(error: string): never {
  console.log(`\nERROR: ${error}\n`)
  process.exit(1)
}

async function getGitBranch(cwd?: string) {
  const { stdout } = await exec(`git status`, { cwd })
  return /On branch (.+)/gm.exec(stdout)?.[1] || ''
}

function userRespondsYes(prompt: string = '(y/N)? ') {
  const answer = readlineSync.question(prompt).trim().toLowerCase()
  return answer === 'y' || answer === 'yes'
}
