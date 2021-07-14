import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import modifyRecord from '../../action_modify_record/src/modifyRecord'
import { patternGen } from 'custom_string_patterns'
import { get as extractObjectProperty } from 'lodash'

async function generateTextString({
  parameters,
  applicationData,
  outputCumulative,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  const {
    pattern,
    counterName,
    customFields,
    additionalData = {},
    counterInit,
    numberFormat,
    fallbackText = 'Missing_data_property',
    updateRecord = false,
    tableName = 'application',
    fieldName = 'name',
    matchField = 'id',
    matchValue = applicationData?.applicationId,
  } = parameters
  const db = databaseMethods(DBConnect)
  const data = {
    applicationData,
    outputCumulative,
    ...additionalData,
  }

  // Turn data into customReplacer functions
  const customReplacers: any = {}
  if (customFields)
    for (const key of Object.keys(customFields)) {
      customReplacers[key] = () => extractObjectProperty(data, customFields[key], fallbackText)
    }

  try {
    if (counterName && !(await db.doesCounterExist(counterName)))
      await db.createCounter(counterName, counterInit)

    const generatedText = await patternGen(
      pattern,
      {
        getCounter: counterName ? () => DBConnect.getCounter(counterName) : undefined,
        numberFormat,
        customReplacers,
        fallbackString: fallbackText,
      },
      { data }
    )
    console.log('Text string created:', generatedText)

    // Update database record if requested
    if (updateRecord) {
      const result = await modifyRecord({
        parameters: {
          tableName,
          matchField,
          matchValue,
          [fieldName]: generatedText,
          shouldCreateJoinTable: false,
        },
        DBConnect,
      })
      if (result.status === 'SUCCESS')
        return {
          status: ActionQueueStatus.Success,
          error_log: '',
          output: { generatedText },
        }
      else
        return {
          status: ActionQueueStatus.Fail,
          error_log: 'Problem updating database',
        }
    }
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { generatedText },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default generateTextString
