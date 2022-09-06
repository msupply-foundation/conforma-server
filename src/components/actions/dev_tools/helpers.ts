import { actionLibrary } from '../../pluginsConnect'
import { getApplicationData } from '.././getApplicationData'
import { combineRequestParams } from '../../utilityFunctions'
import DBConnect from '../../databaseConnect'
import db from './databaseMethods'
import { processTrigger } from '.././processTrigger'
import { Trigger } from '../../../generated/graphql'

export const selectRandomReviewAssignment = async (
  applicationId: number,
  sectionCodes: string[]
) => {
  const reviewAssignments = await (
    await db.getReviewAssignments(applicationId)
  )
    .map(({ id, allowed_sections }) => ({
      id,
      allowedSections:
        !allowed_sections || allowed_sections.length === 0 ? sectionCodes : allowed_sections,
    }))
    .sort((a, b) => b.allowedSections.length - a.allowedSections.length)
    .filter(
      ({ allowedSections }, _, arr) => allowedSections.length === arr[0].allowedSections.length
    )

  return reviewAssignments[Math.floor(Math.random() * reviewAssignments.length)]
}
