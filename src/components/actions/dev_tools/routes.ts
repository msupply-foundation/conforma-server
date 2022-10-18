import { actionLibrary } from '../../pluginsConnect'
import { getApplicationData } from '.././getApplicationData'
import { combineRequestParams } from '../../utilityFunctions'
import DBConnect from '../../databaseConnect'
import db from './databaseMethods'
import { processTrigger } from '.././processTrigger'
import {
  ActionQueueStatus,
  ApplicationOutcome,
  ApplicationStatus,
  Decision,
  Trigger,
} from '../../../generated/graphql'
import {
  selectRandomReviewAssignment,
  getRandomReviewId,
  getApplicationBasics,
  mapTriggerShortcut,
} from './helpers'
import { ActionApplicationData, ActionResult, TriggerPayload } from '../../../types'

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
  eventCode?: string
  applicationId?: number
  serial?: string
  stageNumber?: number
  status?: ApplicationStatus
  outcome?: ApplicationOutcome
  applicationDataOverride: Partial<ActionApplicationData>
}

export const routeTestTrigger = async (request: any, reply: any) => {
  const params: RequestProps = combineRequestParams(request, 'camel')
  let { applicationId, serial } = params
  const {
    templateCode,
    trigger,
    assignmentId,
    sections,
    reviewId,
    decision,
    comment,
    eventCode,
    stageNumber,
    status,
    outcome,
    applicationDataOverride = {},
  }: RequestProps = params

  const triggerFull = mapTriggerShortcut(trigger)

  const { configId, configSerial, templateId, sectionCodes } = await db.getConfigApplicationInfo(
    templateCode
  )

  if (!configId) reply.send('Invalid template code, or no config application available')

  const { appId, appSerial } = await getApplicationBasics(
    applicationId,
    serial,
    configId,
    configSerial
  )

  applicationId = appId
  serial = appSerial

  let actionsOutput: ActionResult[] = []
  let finalApplicationData

  if (stageNumber) applicationDataOverride.stageNumber = stageNumber
  if (status) applicationDataOverride.status = status
  if (outcome) applicationDataOverride.outcome = outcome

  // A dummy triggerPayload object, as though it was retrieved from the
  // trigger_queue table
  const triggerPayload: TriggerPayload = {
    trigger_id: null,
    trigger: Trigger.DevTest,
    table: 'application',
    record_id: appId,
    applicationDataOverride,
  }

  switch (triggerFull) {
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

    case 'ON_SCHEDULE':
      if (!eventCode) return reply.send('eventCode required')
      const { id, data } = await db.getScheduledEvent(applicationId, eventCode)
      triggerPayload.trigger = Trigger.OnSchedule
      triggerPayload.table = 'trigger_schedule'
      triggerPayload.record_id = id
      triggerPayload.data = data
      actionsOutput = await processTrigger(triggerPayload)
      finalApplicationData = await getApplicationData({ applicationId })
      break

    case 'ON_PREVIEW':
      const revId = reviewId ?? (await getRandomReviewId(applicationId))
      triggerPayload.trigger = Trigger.OnPreview
      triggerPayload.table = 'review'
      triggerPayload.record_id = revId
      triggerPayload.applicationDataOverride = {
        ...applicationDataOverride,
        reviewData: {
          latestDecision: {
            decision: decision ?? Decision.Conform,
            comment: comment ?? 'Test comment',
          },
        },
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
        // Create a review record and review_decision record
        const { id: revId } = await db.createReview(assignment.id)
        await db.createReviewDecision(revId)
        // Create one review response

        // TO-DO: Make some review responses and give them dummy values?

        triggerPayload.trigger = Trigger.OnReviewCreate
        triggerPayload.table = 'review'
        triggerPayload.record_id = revId

        actionsOutput = await processTrigger(triggerPayload)
        finalApplicationData = await getApplicationData({ applicationId, reviewId: revId })
      }
      break

    case 'ON_REVIEW_RESTART':
      {
        const revId = reviewId ?? (await getRandomReviewId(applicationId))

        triggerPayload.trigger = Trigger.OnReviewRestart
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
    trigger: triggerFull,
    failedActions: failedActions.length > 0 ? failedActions : undefined,
    actionResult: actionsOutput,
    finalApplicationData,
  })
}
