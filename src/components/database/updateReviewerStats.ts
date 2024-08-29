/**
 * Function to update reviewer/assigner stats:
 * - the "reviewer_list" and "assigner_list" on application
 * - the "application_reviewer_action" table, which contains a list of every
 *   reviewer's possible actions (Assign, Review, Re-assign, etc) for every
 *   application they could be interacting with
 *
 * It is called by a notification listener (in postgresConnect), which notified
 * by triggers on various tables (see the cases below). Putting it here rather
 * than as a database PG function allows it to be run asynchronously and not
 * block other updates (as this process can be somewhat slow when there are a
 * lot of applications and reviewers in the system).
 */

import DBConnect from '../../components/database/databaseConnect'
import { errorMessage } from '../utilityFunctions'
import config from '../../config'

interface NotificationPayload {
  tableName: string
  data: Record<string, unknown>
  operation: 'UPDATE' | 'INSERT'
}

export const updateReviewerStats = async ({ tableName, data, operation }: NotificationPayload) => {
  let applicationId: number = 0
  let reviewerIds: number[] = []

  const db = databaseMethods

  console.log({ tableName, data, operation })
  console.log(`Updating reviewer action stats due to ${operation} trigger on table: ${tableName} `)

  switch (tableName) {
    case 'review_assignment':
      applicationId = data.application_id as number
      if (operation === 'INSERT') {
        reviewerIds.push(data.reviewer_id as number)
      }
      if (operation === 'UPDATE') {
        reviewerIds = await db.getAllStaffForApplication(applicationId)
      }
      break
    case 'review_assignment_assigner_join':
      applicationId = await db.getApplicationIdFromReviewAssignment(
        data.review_assignment_id as number
      )
      reviewerIds.push(data.assigner_id as number)
      break
    case 'review_status_history':
      break
    case 'application':
      break
  }

  // Update reviewer/assigner lists on application table
  console.log('Updating reviewer/assigner lists for application:', applicationId)
  await db.updateApplicationStaffLists(applicationId)

  // Update application_reviewer_actions
  reviewerIds = reviewerIds.filter((id) => id !== null)

  for (const userId of reviewerIds) {
    console.log(`Updating actions for user ${userId} on application ${applicationId}`)
    await db.upsertReviewerAction(applicationId, userId)
  }

  // Clean up NULL records
  await db.cleanupNullReviewerActions(applicationId)
}

const databaseMethods = {
  updateApplicationStaffLists: async (appId: number) => {
    try {
      const text = `
        WITH lists AS (
                SELECT reviewers, assigners
                FROM single_application_detail($1)
            ) 
        UPDATE public.application
            SET reviewer_list = (SELECT reviewers FROM lists),
            assigner_list = (SELECT assigners FROM lists)
            WHERE id = $1;`
      await DBConnect.query({
        text,
        values: [appId],
      })
    } catch (err) {
      console.log('ERROR updating staff lists for application', appId)
      console.log(errorMessage(err))
      throw err
    }
  },
  getAllStaffForApplication: async (appId: number) => {
    try {
      const text = `
        SELECT DISTINCT UNNEST(ARRAY[reviewer_id, raaj.assigner_id])
        FROM review_assignment ra
        LEFT JOIN review_assignment_assigner_join raaj
        ON ra.id = raaj.review_assignment_id
        WHERE application_id = $1;
        `
      const result = await DBConnect.query({
        text,
        values: [appId],
        rowMode: 'array',
      })
      return result.rows.flat()
    } catch (err) {
      console.log('ERROR getting staff lists for application', appId)
      console.log(errorMessage(err))
      throw err
    }
  },
  getApplicationIdFromReviewAssignment: async (assignmentId: number) => {
    try {
      const text = `
        SELECT application_id FROM review_assignment
            WHERE id = $1;
        `
      const result = await DBConnect.query({
        text,
        values: [assignmentId],
        rowMode: 'array',
      })
      return result.rows[0].application_id
    } catch (err) {
      console.log('ERROR getting applicationId for reviewAssignment', assignmentId)
      console.log(errorMessage(err))
      throw err
    }
  },
  upsertReviewerAction: async (appId: number, userId: number) => {
    try {
      const text = `
        WITH actions AS (
            SELECT reviewer_action, assigner_action
                FROM single_application_detail($1, $2)
            ) 
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, reviewer_action, assigner_action)  
        VALUES(
            $2,
            $1,
            (SELECT reviewer_action FROM actions),
            (SELECT assigner_action FROM actions)
        )
        ON CONFLICT (user_id, application_id)
        DO UPDATE
            SET reviewer_action = (SELECT reviewer_action FROM actions),
            assigner_action = (SELECT assigner_action FROM actions);`
      await DBConnect.query({
        text,
        values: [appId, userId],
      })
    } catch (err) {
      console.log(`ERROR updating actions for user ${userId} on application ${appId}`)
      console.log(errorMessage(err))
      throw err
    }
  },
  cleanupNullReviewerActions: async (appId: number) => {
    try {
      const text = `
        DELETE FROM public.application_reviewer_action
        WHERE application_id = $1
        AND reviewer_action IS NULL
        AND assigner_action IS NULL;`
      await DBConnect.query({
        text,
        values: [appId],
      })
    } catch (err) {
      console.log(`ERROR cleaning up actions for application ${appId}`)
      console.log(errorMessage(err))
      throw err
    }
  },
}
