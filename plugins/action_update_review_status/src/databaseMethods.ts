import { Review, ReviewStatus } from '../../../src/generated/graphql'

const databaseMethods = (DBConnect: any) => ({
  getAssociatedReviews: async (applicationId: number, stageId: number, level: number) => {
    const text = `
    SELECT
      review.id AS "reviewId",
      review_assignment_id AS "reviewAssignmentId",
      review_assignment.application_id AS "applicationId",
      review_assignment.reviewer_id AS "reviewerId",
      review_assignment.level_number AS "levelNumber",
      review_assignment.id AS "reviewAssignmentId",
      review_assignment.assigned_sections AS "assignedSections",
      review_status_history.status AS "reviewStatus"
      FROM review_assignment 
        LEFT JOIN review ON review_assignment.id = review.review_assignment_id 
        LEFT JOIN review_status_history ON review.id = review_status_history.review_id 
          AND review_status_history.is_current = true
      WHERE 
        review.application_id = $1
        AND review.stage_number = $2
        AND review.level_number = $3
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId, stageId, level] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getChangedSections: async (templateElements: number[]) => {
    const text = `
    SELECT code FROM template_section
      WHERE id IN (
        SELECT DISTINCT section_id FROM public.template_element
        WHERE id = ANY($1)
        )
    `
    try {
      const result = await DBConnect.query({ text, values: [templateElements] })
      return result.rows.map(({ code }: { code: string }) => code)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },

  getAssociatedReviewAssignmentNotStarted: async (
    applicationId: number,
    stageId: number,
    level: number
  ) => {
    const text = `
      SELECT
      review_assignment.id AS "reviewAssignmentId",
      review_assignment.is_locked AS "isLocked"
      FROM review_assignment 
        LEFT JOIN review ON review_assignment.id = review.review_assignment_id 
      WHERE 
        review_assignment.application_id = $1
        AND review_assignment.stage_id = $2
        AND review_assignment.level_number = $3
        AND review.id IS NULL
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId, stageId, level] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getReviewAssignedElementIds: async (reviewAssignmentId: number) => {
    const text = `
    SELECT DISTINCT(te.id) AS "templateElementId"
    FROM template_element te JOIN template_section ts
    ON te.section_id = ts.id
    JOIN (
    		SELECT id, application_id, template_id, UNNEST(assigned_sections) as section_code
    		FROM review_assignment
    	) ra 
    ON ra.template_id = ts.template_id  
    WHERE ra.id = $1
    AND ts.code = ra.section_code
    AND te.category = 'QUESTION'
    `
    try {
      const result = await DBConnect.query({ text, values: [reviewAssignmentId] })
      return result.rows.map(({ templateElementId }: any) => templateElementId)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  setReviewAssignmentIsLocked: async (reviewAssignmnetId: number, isLocked: boolean) => {
    const text = 'UPDATE review_assignment SET is_locked = $1 WHERE id = $2'
    try {
      const result = await DBConnect.query({ text, values: [isLocked, reviewAssignmnetId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
