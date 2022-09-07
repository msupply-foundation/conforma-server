import { actionLibrary } from '../../pluginsConnect'
import { getApplicationData } from '.././getApplicationData'
import { combineRequestParams } from '../../utilityFunctions'
import DBConnect from '../../databaseConnect'
import db from './databaseMethods'
import { processTrigger } from '.././processTrigger'
import { ActionQueueStatus, Decision, Trigger } from '../../../generated/graphql'
import { selectRandomReviewAssignment, getRandomReviewId } from './helpers'
import { ActionResult } from '../../../types'

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
  trigger: Trigger | 'RESET'
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

  let actionsOutput: ActionResult[] = []
  let finalApplicationData

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
    case 'DEV_TEST':
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_APPLICATION_CREATE':
      // To-do: actually create an "is_config" application -- currently relies
      // on one already existing
      triggerPayload.trigger = Trigger.OnApplicationCreate
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_APPLICATION_RESTART':
      triggerPayload.trigger = Trigger.OnApplicationRestart
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_APPLICATION_SUBMIT':
      triggerPayload.trigger = Trigger.OnApplicationSubmit
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_EXTEND':
      triggerPayload.trigger = Trigger.OnExtend
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_PREVIEW':
      const revId = reviewId ?? (await getRandomReviewId(applicationId))
      triggerPayload.trigger = Trigger.OnPreview
      triggerPayload.table = 'review'
      triggerPayload.record_id = revId
      triggerPayload.applicationDataOverride = {
        reviewData: { latestDecision: { decision: decision ?? Decision.Conform } },
      }

      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId, reviewId: revId })
      break

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

        actionsOutput = await processTrigger(triggerPayload)
        finalApplicationData = await getApplicationData({
          applicationId,
          reviewAssignmentId: assignmentId,
        })
      }
      break

    case 'ON_REVIEW_CREATE':
      // Get assignment id -- either passed in, or pick one at random (assigned and highest stage/level)
      {
        const assignment = assignmentId
          ? await db.getSingleReviewAssignment(assignmentId)
          : await selectRandomReviewAssignment(applicationId, sectionCodes, true)
        //   Create a review record and review_decision record
        const { id: revId } = await db.createReview(assignment.id)
        await db.createReviewDecision(revId)

        // TO-DO: Make some review responses and give them dummy values?

        triggerPayload.trigger = Trigger.OnReviewCreate
        triggerPayload.table = 'review'
        triggerPayload.record_id = revId

        actionsOutput = await processTrigger(triggerPayload)
        finalApplicationData = await getApplicationData({ applicationId, reviewId: revId })
      }
      break

    case 'ON_REVIEW_SUBMIT':
      {
        const revId = reviewId ?? (await getRandomReviewId(applicationId))
        await db.updateReviewDecision(revId, decision ?? Decision.Conform, comment ?? 'No comment')

        triggerPayload.trigger = Trigger.OnReviewSubmit
        triggerPayload.table = 'review'
        triggerPayload.record_id = revId

        actionsOutput = await processTrigger(triggerPayload)
        finalApplicationData = await getApplicationData({ applicationId, reviewId: revId })
      }
      break

    case 'RESET':
      await db.resetApplication(applicationId)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    default:
      return reply.send('Trigger not recognised')
  }

  const failedActions = actionsOutput.filter(
    (action) => action.status !== ActionQueueStatus.Success
  )

  reply.send({
    applicationId,
    serial,
    failedActions: failedActions.length > 0 ? failedActions : undefined,
    actionResult: actionsOutput,
    finalApplicationData,
  })
}
