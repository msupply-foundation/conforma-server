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

// Determines "definitive" appId and serial depending whether one was passed in,
// or if we're just using the "config" application
export const getApplicationBasics = async (
  applicationId: number | undefined,
  serial: string | undefined,
  configId: number,
  configSerial: string
): Promise<{ appId: number; appSerial: string }> => {
  if (!applicationId && !serial) return { appId: configId, appSerial: configSerial }

  if (applicationId) {
    const appSerial = await db.getSerialFromAppId(applicationId)
    return { appId: applicationId, appSerial }
  }

  const appId = await db.getAppIdFromSerial(serial as string)
  return { appId, appSerial: serial as string }
}
