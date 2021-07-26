import { PermissionPolicyType, ReviewAssignment } from '../../../src/generated/graphql'

const databaseMethods = (DBConnect: any) => ({
  getPersonnelForApplicationStageLevel: async (
    templateId: number,
    stageNumber: number,
    reviewLevel: number,
    type: PermissionPolicyType
  ) => {
    const text = `
    SELECT
      "userId", "orgId", "restrictions", "allowedSections", "canSelfAssign", "canMakeFinalDecision"
      FROM permissions_all
      WHERE "templateId" = $1
      AND "stageNumber" = $2
      AND "reviewLevel" = $3
      AND "permissionType" = '${type}'
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [templateId, stageNumber, reviewLevel],
      })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  addReviewAssignments: async (reviewAssignments: ReviewAssignment[]) => {
    const reviewAssignmentIds = []
    for (const reviewAssignment of reviewAssignments) {
      const {
        reviewerId,
        organisationId,
        stageId,
        stageNumber,
        timeStageCreated,
        status,
        applicationId,
        allowedSections,
        levelNumber,
        isLastLevel,
        isFinalDecision,
      } = reviewAssignment
      // Needs a slightly different query with different CONFLICT restrictions
      // depending on whether orgId exists or not.
      // On conflict, existing records have their Section Restrictions updated,
      // but assignment status remains unchanged.
      const text = `
        INSERT INTO review_assignment (
          reviewer_id, stage_id, stage_number, time_stage_created,
          status, application_id, allowed_sections,
          level_number, is_last_level, organisation_id,
          is_final_decision
          )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (reviewer_id, ${
          organisationId ? ' organisation_id,' : ''
        } stage_number, application_id, level_number)
          WHERE organisation_id IS ${organisationId ? 'NOT ' : ''}NULL
        DO
          UPDATE SET allowed_sections = $7
        RETURNING id`

      try {
        const result = await DBConnect.query({
          text,
          values: [
            reviewerId,
            stageId,
            stageNumber,
            timeStageCreated,
            status,
            applicationId,
            allowedSections,
            levelNumber,
            isLastLevel,
            organisationId,
            isFinalDecision,
          ],
        })
        reviewAssignmentIds.push(result.rows[0].id)

        // TO-DO: What to do with existing records that don't match the
        // generated ones? Delete them? Set their status = "Not Available"?
      } catch (err) {
        console.log(err.message)
        reviewAssignmentIds.push(err.message)
        throw err
      }
    }
    return reviewAssignmentIds
  },
  addReviewAssignmentAssignerJoins: async (reviewAssignmentAssignerJoins: any) => {
    const reviewAssignmentAssignerJoinIds = []
    for (const reviewAssignmentAssignerJoin of reviewAssignmentAssignerJoins) {
      const { assignerId, orgId, reviewAssignmentId } = reviewAssignmentAssignerJoin
      // Needs a slightly different query with different CONFLICT restrictions
      // depending on whether orgId exists or not.
      const text = `
        INSERT INTO review_assignment_assigner_join (
          assigner_id,
          review_assignment_id,
          organisation_id     
          )
        VALUES ($1, $2, $3)
        ON CONFLICT (assigner_id,
          review_assignment_id
          ${orgId ? ', organisation_id' : ''} 
        )
          WHERE organisation_id IS ${orgId ? 'NOT ' : ''}NULL
        DO UPDATE SET organisation_id = ${orgId ? '$3' : 'NULL'}
        RETURNING id
      `
      try {
        const result = await DBConnect.query({
          text,
          values: [assignerId, reviewAssignmentId, orgId],
        })
        reviewAssignmentAssignerJoinIds.push(result.rows[0]?.id)

        // TO-DO: What to do with existing records whose review_assignments
        // weren't updated? (i.e. they should no longer exist)
        // Delete them?
      } catch (err) {
        console.log(err.message)
        reviewAssignmentAssignerJoinIds.push(err.message)
        throw err
      }
    }
    return reviewAssignmentAssignerJoinIds
  },
})

export default databaseMethods
