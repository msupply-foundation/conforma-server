// Configure a snapshot to be used with this test suite.
import { readFileSync } from 'fs'
import { loadActionPlugins } from '../../pluginsConnect'
import { RequestProps, testTrigger } from './routes'
import useSnapshot from '../../../components/snapshots/useSnapshot'
import { TEST_SCRIPT_FOLDER, SNAPSHOT_FOLDER } from '../../../constants'

interface TestData {
  name: string
  input: RequestProps
  output: Partial<ReturnType<typeof testTrigger>>
}

interface TestScript {
  snapshot: string
  tests: TestData[]
}

const inputTest = process.argv.slice(-1)[0] === 'eventTesting' ? null : process.argv.slice(-1)[0]

if (inputTest) console.log('Requested test suite', inputTest)

// Load test json file, from following sources (tries until match found):
// - "snapshot_test_scripts" folder -- match {inputTest}.json
// - snapshot named ${inputTest} -- look for "tests.json" within
// - load default snap from .env file: BUILD_TEST_SNAPSHOT
const testFileSources = [
  {
    source: inputTest ? `${TEST_SCRIPT_FOLDER}/${inputTest}.json` : null,
    errorMessage: `${inputTest} not found in "snapshot_test_scripts". Checking snapshots... `,
  },
  {
    source: inputTest ? `${SNAPSHOT_FOLDER}/${inputTest}/tests.json` : null,
    errorMessage: `${inputTest} not found in "snapshots". Checking default from .env... `,
    snapshotName: inputTest,
  },
  {
    source: `${SNAPSHOT_FOLDER}/${process.env.BUILD_TEST_SNAPSHOT}/tests.json`,
    errorMessage: `No default test snapshot defined. Exiting...`,
    snapshotName: process.env.BUILD_TEST_SNAPSHOT,
  },
]

let testData: TestData[] = []
let snapshotName: string = ''

for (const testSource of testFileSources) {
  if (!testSource.source) continue
  try {
    const testScript: TestScript = JSON.parse(readFileSync(testSource.source, 'utf-8'))
    testData = testScript.tests
    snapshotName = testSource.snapshotName || testScript.snapshot
  } catch {
    console.log(testSource.errorMessage)
  }
  if (snapshotName) break
}

beforeAll((done) => {
  if (!snapshotName) done('No valid snapshot')
  // Load snapshot
  useSnapshot({ snapshotName }).then(({ success }) => {
    if (success) done()
    else done('Failed to load snapshot')
  })
  loadActionPlugins()
})

testData.forEach(({ name, input, output }) => {
  test(name, async () => {
    const result = await testTrigger(input)
    expect(result).toMatchObject(output)
  })
})
