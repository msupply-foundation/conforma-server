// Configure a snapshot to be used with this test suite.
import { readFileSync } from 'fs'
import { getAppEntryPointDir } from '../../utilityFunctions'

import { loadActionPlugins } from '../../pluginsConnect'
import { testTrigger } from './routes'
import useSnapshot from '../../../components/snapshots/useSnapshot'

const testFile = process.argv.pop()

// Read test json file
const testData = JSON.parse(
  readFileSync(`src/components/actions/dev_tools/testData/${testFile}.json`, 'utf-8')
)

beforeAll((done) => {
  // Load snapshot
  useSnapshot({ snapshotName: testData.snapshot }).then(({ success }) => {
    if (success) done()
    else done('Failed to load snapshot')
  })
  loadActionPlugins()
})

testData.tests.forEach(({ name, input, output }: any) => {
  test(name, async () => {
    const result = await testTrigger(input)
    expect(result).toEqual(expect.objectContaining(output))
  })
})
