import { actionLibrary } from '../../pluginsConnect'
import { getApplicationData } from '.././getApplicationData'
import { combineRequestParams } from '../../utilityFunctions'
import DBConnect from '../../databaseConnect'
import db from './databaseMethods'
import { processTrigger } from '.././processTrigger'
import { Decision, Trigger } from '../../../generated/graphql'
import { selectRandomReviewAssignment, getRandomReviewId } from './helpers'

// These routes should only be used for testing in development. They should
// NEVER be used in the app.

export const routeRunAction = async (request: any, reply: any) => {
  const { actionCode, applicationId, reviewId, parameters } = combineRequestParams(request, 'camel')
  const applicationData = applicationId ? await getApplicationData({ applicationId, reviewId }) : {}
  const actionResult = await actionLibrary[actionCode]({
    parameters,
    applicationData,
    DBConnect,
  })
  return reply.send(actionResult)
}

interface RequestProps {
  templateCode: string
  trigger: Trigger | 'Reset'
  assignmentId?: number
  sections?: string[]
  reviewId?: number
  decision?: Decision
  comment?: string
}

export const routeTestTrigger = async (request: any, reply: any) => {
  const {
    templateCode,
    trigger,
    assignmentId,
    sections,
    reviewId,
    decision,
    comment,
  }: RequestProps = combineRequestParams(request, 'camel')
  const { applicationId, serial, templateId, sectionCodes } = await db.getConfigApplicationInfo(
    templateCode
  )

  if (!applicationId) reply.send('Invalid template code, or no config application available')

  let result
  // A dummy triggerPayload object, as though it was retrieved from the
  // trigger_queue table
  const triggerPayload = {
    trigger_id: null,
    trigger: Trigger.DevTest,
    table: 'application',
    record_id: applicationId,
    applicationDataOverride: {},
  }

  switch (trigger) {
    case 'ON_APPLICATION_CREATE':
      triggerPayload.trigger = Trigger.OnApplicationCreate
      result = await processTrigger(triggerPayload)
      break
    case 'ON_APPLICATION_RESTART':
      triggerPayload.trigger = Trigger.OnApplicationRestart
      result = await processTrigger(triggerPayload)
      break
    case 'ON_APPLICATION_SUBMIT':
      triggerPayload.trigger = Trigger.OnApplicationSubmit
      result = await processTrigger(triggerPayload)
      break
    case 'ON_EXTEND':
      triggerPayload.trigger = Trigger.OnExtend
      result = await processTrigger(triggerPayload)
      break
    case 'ON_PREVIEW':
      console.log('To-do: ON_PREVIEW')
      break
    //   triggerPayload.trigger = Trigger.OnExtend
    //   result = await processTrigger(triggerPayload)
    case 'ON_REVIEW_ASSIGN':
      // If no assignment id, select one at random (using latest stage and level) and assign all possible sections to it
      {
        const assignment = assignmentId
          ? await db.getSingleReviewAssignment(assignmentId)
          : await selectRandomReviewAssignment(applicationId, sectionCodes)
        if (!assignment.allowedSections) assignment.allowedSections = sectionCodes
        if (sections)
          assignment.allowedSections = assignment.allowedSections.filter((section: string) =>
            sections.includes(section)
          )
        await db.assignReview(assignment)

        triggerPayload.trigger = Trigger.OnReviewAssign
        triggerPayload.table = 'review_assignment'
        triggerPayload.record_id = assignment.id

        result = await processTrigger(triggerPayload)
      }
      break
    case 'ON_REVIEW_CREATE':
      // Get assignment id -- either passed in, or pick one at random (assigned and highest stage/level)
      {
        const assignment = assignmentId
          ? await db.getSingleReviewAssignment(assignmentId)
          : await selectRandomReviewAssignment(applicationId, sectionCodes)
        //   Create a review record and review_decision record
        const { id: reviewId } = await db.createReview(assignment.id)
        await db.createReviewDecision(reviewId)

        triggerPayload.trigger = Trigger.OnReviewCreate
        triggerPayload.table = 'review'
        triggerPayload.record_id = reviewId

        result = await processTrigger(triggerPayload)
      }
      break
    case 'ON_REVIEW_SUBMIT':
      {
        const revId = reviewId ?? (await getRandomReviewId(applicationId))
        await db.updateReviewDecision(revId, decision ?? Decision.Conform, comment ?? 'Okay')
        // Trigger review record
        triggerPayload.trigger = Trigger.OnReviewSubmit
        triggerPayload.table = 'review'
        triggerPayload.record_id = revId

        result = await processTrigger(triggerPayload)
      }
      break
    case 'Reset':
      // TO-DO:
      // Delete
      // -review_assignments,
      // -application_status_history except first one
      // application_stauge_history except first one
      break
    default:
      return reply.send('Trigger not recognised')
  }

  reply.send({ applicationId, serial, result })

  // const appDataParams: { applicationId: number; reviewId?: number } = {
  //   applicationId: Number(applicationId),
  // }
  // if (reviewId) appDataParams.reviewId = Number(reviewId)
  reply.send({ applicationId })
}
