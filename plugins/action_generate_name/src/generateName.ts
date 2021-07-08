import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import evaluateExpression from '@openmsupply/expression-evaluator'
import { EvaluatorNode } from '@openmsupply/expression-evaluator/lib/types'
import replaceAsync from 'string-replace-async'
import modifyRecord from '../../action_modify_record/src/modifyRecord'

async function generateName({
  parameters,
  applicationData,
  DBConnect,
}: ActionPluginInput): Promise<ActionPluginOutput> {
  const {
    tableName = 'application',
    fieldName = 'name',
    matchField = 'id',
    matchValue = applicationData?.applicationId,
    shouldUpdateDatabase = true,
    additionalData = {},
    fallbackString = 'UNRESOLVED',
    formatExpression = '${applicationData.templateName} — ${applicationData.applicationSerial}',
  } = parameters

  try {
    const generatedString = await generateString(
      formatExpression,
      {
        applicationData,
        ...additionalData,
      },
      fallbackString
    )
    console.log('Name generated: ' + generatedString)

    if (shouldUpdateDatabase) {
      const result = await modifyRecord({
        parameters: {
          tableName,
          matchField,
          matchValue,
          [fieldName]: generatedString,
          shouldCreateJoinTable: false,
        },
        DBConnect,
      })
      if (result.status === 'SUCCESS')
        return {
          status: ActionQueueStatus.Success,
          error_log: '',
          output: { generatedName: generatedString },
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
      output: { generatedName: generatedString },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default generateName

// formatExpression can be either a string (with ${} style substitution) or a
// full-blown evaluator expression (which must return a string)
const generateString = async (
  formatExpression: string | EvaluatorNode,
  data: object,
  fallbackString: string
): Promise<string> => {
  if (typeof formatExpression === 'string')
    return await substituteValues(formatExpression, data, fallbackString)
  return (await evaluateExpression(formatExpression, { objects: data })) as string
}

const substituteValues = async (
  formatExpression: string,
  data: object,
  fallbackString: string
): Promise<string> => {
  const extractObjectProperty = async (property: string, data: object) => {
    return (await evaluateExpression(
      { operator: 'objectProperties', children: [property, fallbackString] },
      { objects: data }
    )) as string
  }
  return await replaceAsync(
    formatExpression,
    /(\${)(.*?)(})/gm,
    async (_: string, $: string, property: string) => await extractObjectProperty(property, data)
  )
}
