import databaseMethods from './databaseMethods'
import isEqual from '@openmsupply/deep-comparison'

interface Response {
  id: number
  code: string
  value: { [key: string]: any }
  comment?: string
  decision?: string
  time_updated: any
}

interface ResponsesByCode {
  [key: string]: Response[]
}

module.exports['trimResponses'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  console.log('Trimming unchanged duplicated responses...')

  try {
    const { applicationId, reviewId } = input
    // Get ALL responses associated with application OR review
    const responses = reviewId
      ? await db.getAllReviewResponses(reviewId)
      : await db.getAllApplicationResponses(applicationId)

    // Create object of responses indexed by code, with response
    // objects added to array for each code
    const responsesByCode: ResponsesByCode = {}
    responses.forEach((response: Response) => {
      const { code } = response
      if (reviewId) response.value = { comment: response.comment, decision: response.decision }
      if (!(code in responsesByCode)) responsesByCode[code] = [response]
      else responsesByCode[code].push(response)
    })

    const responsesToDelete: number[] = []
    const responsesToUpdate: number[] = []

    Object.values(responsesByCode).forEach((responseArray) => {
      if (responseArray.length === 1) return
      const latestResponse = responseArray[responseArray.length - 1]
      const previousResponse = responseArray[responseArray.length - 2]
      if (isEqual(latestResponse.value, previousResponse.value))
        responsesToDelete.push(latestResponse.id)
      else responsesToUpdate.push(latestResponse.id)
    })

    // Run delete operation on all in toDelete array (new method)
    const deletedCodes = reviewId
      ? await db.deleteReviewResponses(responsesToDelete)
      : await db.deleteApplicationResponses(responsesToDelete)

    // Update timestamp of remaining responses
    const updatedCodes = reviewId
      ? await db.updateReviewResponseTimestamps(responsesToUpdate)
      : await db.updateApplicationResponseTimestamps(responsesToUpdate)

    console.log('Codes of deleted responses: ', deletedCodes)
    console.log('Codes of updated responses: ', updatedCodes)

    return {
      status: 'Success',
      error_log: '',
      output: {
        deletedCodes,
        updatedCodes,
      },
    }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem trimming duplicated responses.',
    }
  }
}
