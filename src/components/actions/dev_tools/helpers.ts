import db from './databaseMethods'

export const selectRandomReviewAssignment = async (
  applicationId: number,
  sectionCodes: string[],
  assigned: boolean = false
) => {
  const reviewAssignments = await (assigned
    ? await db.getAssignedReviewAssignments(applicationId)
    : await db.getReviewAssignments(applicationId)
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

export const getRandomReviewId = async (applicationId: number) => {
  const reviews = await db.getValidReviews(applicationId)
  return reviews[Math.floor(Math.random() * reviews.length)].reviewId
}
