// Configure a snapshot to be used with this test suite.
import { readFileSync } from 'fs'
import { loadActionPlugins } from '../../pluginsConnect'
import { testTrigger } from './routes'
import useSnapshot from '../../../components/snapshots/useSnapshot'
import { TEST_SCRIPT_FOLDER, SNAPSHOT_FOLDER } from '../../../constants'

const testFile = process.argv.pop()

// Read test json file
let testData: any
let snapshotName: string
try {
  const testScript = JSON.parse(readFileSync(`${TEST_SCRIPT_FOLDER}/${testFile}.json`, 'utf-8'))
  testData = testScript.tests
  snapshotName = testScript.snapshot
} catch {
  console.log(`No test script named "${testFile}.json" found. Attempting to find in snapshot...`)
  const testScript = JSON.parse(readFileSync(`${SNAPSHOT_FOLDER}/${testFile}/tests.json`, 'utf-8'))
  testData = testScript.tests
  snapshotName = testFile as string
}

beforeAll((done) => {
  // Load snapshot
  useSnapshot({ snapshotName }).then(({ success }) => {
    if (success) done()
    else done('Failed to load snapshot')
  })
  loadActionPlugins()
})

testData.forEach(({ name, input, output }: any) => {
  test(name, async () => {
    const result = await testTrigger(input)
    expect(result).toMatchObject(output)
  })
})
