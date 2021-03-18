const databaseMethods = (DBConnect: any) => ({
  getReviewersForApplicationStageLevel: async (
    templateId: number,
    stageNumber: number,
    reviewLevel: number
  ) => {
    const text = `
    SELECT
      "userId", "orgId",
      "templatePermissionRestrictions" AS restrictions
      FROM permissions_all
      WHERE "templateId" = $1
      AND "stageNumber" = $2
      AND "reviewLevel" = $3
      AND "permissionType" = 'Review'
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
})

export default databaseMethods
