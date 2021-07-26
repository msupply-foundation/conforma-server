import { ActionQueueStatus } from '../../../src/generated/graphql'
import { ActionPluginType } from '../../types'
import { generatePDF } from '../../../src/components/files/documentGenerate'

const generateDoc: ActionPluginType = async ({
  parameters,
  applicationData,
  // DBConnect,
  outputCumulative,
}) => {
  const { docTemplateId } = parameters
  const data = parameters?.data ?? { ...applicationData, ...outputCumulative }
  const userId = parameters?.userId ?? applicationData?.userId
  const applicationSerial = parameters?.applicationSerial ?? applicationData?.applicationSerial
  const templateId = parameters?.templateId ?? applicationData?.templateId

  try {
    const result = await generatePDF({
      fileId: docTemplateId,
      data,
      userId,
      templateId,
      applicationSerial,
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
