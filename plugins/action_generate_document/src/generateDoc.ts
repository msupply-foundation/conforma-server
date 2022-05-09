import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import { generatePDF } from '../../../src/components/files/documentGenerate'
import { mapValues, get } from 'lodash'

const generateDoc: ActionPluginType = async ({
  parameters,
  applicationData,
  // DBConnect,
  outputCumulative,
}) => {
  const { options, docTemplateId, data, additionalData, description, isOutputDoc } = parameters
  const userId = parameters?.userId ?? applicationData?.userId
  const applicationSerial = parameters?.applicationSerial ?? applicationData?.applicationSerial
  const templateId = parameters?.templateId ?? applicationData?.templateId

  // Build full data object
  const allData = {
    ...applicationData,
    ...outputCumulative,
    ...mapValues(data, (property) => get(applicationData, property, null)),
    additionalData,
  }

  try {
    const result = await generatePDF({
      fileId: docTemplateId,
      data: allData,
      options,
      userId,
      templateId,
      applicationSerial,
      description,
      isOutputDoc,
    })
    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { document: result },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: ActionQueueStatus.Fail,
      error_log: error.message,
    }
  }
}

export default generateDoc
