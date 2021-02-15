import databaseMethods from './databaseMethods'
import isEqual from './deepComparison'

interface ApplicationResponse {
  id: number
  code: string
  value: { [key: string]: any }
  time_created: any
}

interface ResponsesByCode {
  [key: string]: ApplicationResponse[]
}

module.exports['trimResponses'] = async function (input: any, DBConnect: any) {
  const db = databaseMethods(DBConnect)

  try {
    const { applicationId, reviewId } = input
    // Get ALL responses associated with application OR review (new method)
    const responses = reviewId
      ? await db.getAllReviewResponses(reviewId)
      : await db.getAllApplicationResponses(1000)
    // : await db.getAllApplicationResponses(applicationId)

    // Create object of responses indexed by code, with response objects added to array in each
    const responsesByCode: ResponsesByCode = {}
    responses.forEach((response: ApplicationResponse) => {
      const { id, code, value, time_created } = response
      if (!(code in responsesByCode)) responsesByCode[code] = [response]
      else responsesByCode[code].push(response)
    })

    // Create a toDelete array (just IDs)
    const responsesToDelete: number[] = []

    // For each response array:
    //  - sort by timeCreated
    //  - if LAST is identical to 2nd-to-last (deep equality), add id of last to toDelete array
    Object.entries(responsesByCode).forEach(([code, responseArray]) => {
      if (responseArray.length === 1) return
      const latestResponse = responseArray[responseArray.length - 1]
      const previousResponse = responseArray[responseArray.length - 2]
      if (isEqual(latestResponse.value, previousResponse.value))
        responsesToDelete.push(latestResponse.id)
    })

    console.log('to delete:', responsesToDelete)

    // Run delete operation on all in toDelete array (new method)

    const result = { success: true, deletedCodes: [1, 2, 3, 4] }
    if (result.success)
      return {
        status: 'Success',
        error_log: '',
        output: {
          deletedCodes: result.deletedCodes,
        },
      }
    else
      return {
        status: 'Fail',
        error_log: 'There was a problem trimming duplicated responses.',
      }
  } catch (error) {
    console.log(error.message)
    return {
      status: 'Fail',
      error_log: 'There was a problem trimming duplicated responses.',
    }
  }
}
