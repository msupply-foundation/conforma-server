import { Review } from './updateReviewStatuses'

const databaseMethods = (DBConnect: any) => ({
  getAssociatedReviews: async (applicationId: number, stageId: number): Promise<Review[]> => {
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
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId, stageId] })
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
})

export default databaseMethods
