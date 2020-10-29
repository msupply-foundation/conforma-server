type IParameters = {
  applicationId: number
}

type Stages = {
  id: number
  number: number
  title: string
}

module.exports['incrementStage'] = async function (parameters: IParameters, DBConnect: any) {
  const { applicationId } = parameters
  // Get templateID
  try {
    const templateId: number = await DBConnect.getTemplateId('application', applicationId)

    const allStages: Stages[] = await DBConnect.getTemplateStages(templateId)

    const maxStageNum = Math.max(...allStages.map((stage) => stage.number))

    const currentStageId = await DBConnect.getCurrentStageId(3)

    const currentStageNum = allStages.find((stage) => stage.id === currentStageId)?.number

    console.log('Current Stage', currentStageNum)

    const newStageNum = currentStageNum
      ? currentStageNum + 1 <= maxStageNum
        ? currentStageNum + 1
        : currentStageNum
      : 1

    console.log('New NUmver', newStageNum)

    return {
      status: 'Success',
      error_log: '',
    }
  } catch (err) {
    console.log('Unable to load template Stage info')
    console.log(err.message)
    return {
      status: 'Fail',
      error_log: 'Unable to load template Stage info',
    }
    return
  }
  // Get list of Stages id, num, name for Template
  // Get Current Stage of Application
  // If none -- create one, create new Status = Draft
  // If there is one
  // -- set isCurrent to false (maybe Postgres function to auto-turn off other is_Currents)
  // -- new Stage history record +1
  // -- Relink Status history record
  // Output "applicationId", "stageNumber, stageName, currentStatus"
  //

  // try {
  //   console.log(`\nUpdating application: ${newOutcome}`)
  //   const success = await DBConnect.setApplicationOutcome(application_id, newOutcome)
  //   if (success)
  //     return {
  //       status: 'Success',
  //       error_log: '',
  //       output: {
  //         applicationId: application_id,
  //         newOutcome,
  //       },
  //     }
  //   else
  //     return {
  //       status: 'Fail',
  //       error_log: 'There was a problem updating the application.',
  //     }
  // } catch (error) {
  //   return {
  //     status: 'Fail',
  //     error_log: 'There was a problem updating the application.',
  //   }
  // }
}
