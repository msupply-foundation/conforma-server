// Test suite for the createUser Action -- just confirms that users are written to database.

import DBConnect from '../../../components/databaseConnect'

const Action = require('./generateReviewAssignments')

test('Test: getMaxLevels, stage 1', () => {
  return Action.generateReviewAssignments({ templateId: 2, stageNumber: 1 }, DBConnect).then(
    (result: any) => {
      expect(result).toEqual(null)
    }
  )
})

test('Test: getMaxLevels, stage 2', () => {
  return Action.generateReviewAssignments({ templateId: 4, stageNumber: 2 }, DBConnect).then(
    (result: any) => {
      expect(result).toEqual(2)
    }
  )
})
