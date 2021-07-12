import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import databaseMethods from './databaseMethods'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { patternGen } from 'custom_string_patterns'

async function generateSerial({
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
    fallbackText = 'Not_Found',
  } = parameters
  const db = databaseMethods(DBConnect)
  const data = {
    applicationData,
    outputCumulative,
    ...additionalData,
  }

  // Turn data into customReplacer functions
  const customReplacers: any = {}
  for (const key of Object.keys(customFields)) {
    customReplacers[key] = () => extractObjectProperty(customFields[key], data, fallbackText)
  }

  try {
    if (!(await db.doesCounterExist(counterName))) await db.createCounter(counterName, counterInit)

    const generatedSerial = await patternGen(pattern, {
      getCounter: () => DBConnect.getCounter(counterName),
      numberFormat,
      customReplacers,
    })
    console.log(generatedSerial)
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { generatedSerial },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default generateSerial

const extractObjectProperty = async (property: string, data: object, fallbackText: string) => {
  return (await evaluateExpression(
    { operator: 'objectProperties', children: [property, fallbackText] },
    { objects: data }
  )) as string
}
