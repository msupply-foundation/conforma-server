// Configure a snapshot to be used with this test suite.
import { rmdirSync, readFileSync, writeFile } from 'fs'
import { getAppEntryPointDir } from '../../utilityFunctions'

import { loadActionPlugins } from '../../pluginsConnect'
import { testTrigger } from './routes'
import useSnapshot from '../../../components/snapshots/useSnapshot'

const testFile = process.argv.pop()

console.log('TESTFILE', testFile)

beforeAll(async () => {
  // Read json file
  const testData = JSON.parse(
    readFileSync(`src/components/actions/dev_tools/testData/${testFile}.json`, 'utf-8')
  )
  console.log('testData', testData.snapshot)
  // Load snapshot
  await useSnapshot({ snapshotName: testData.snapshot })
  console.log('SNAPSHOT LOADED?')

  loadActionPlugins()
})

// Template type 1

const tests = [
  {
    name: 'Application create',
    input: { templateCode: 'OrgRegistration', trigger: 'create' },
    output: { applicationId: 13 },
  },
  {
    name: 'Application create',
    input: { templateCode: 'OrgRegistration', trigger: 'create' },
    output: { applicationId: 14 },
  },
]

tests.forEach(({ name, input, output }) => {
  test(name, async () => {
    const result = await testTrigger(input)
    expect(result).toEqual(expect.objectContaining(output))
  })
})
