const databaseMethods = (DBConnect: any) => ({
  getApplicationsWithExistingReviewAssignments: async (userIds: number[]) => {
    const text = `SELECT DISTINCT application_id
      FROM review_assignment ra JOIN application app
      ON ra.application_id = app.id
      WHERE app.outcome = 'PENDING'
      AND reviewer_id = ANY($1)
    `
    try {
      const result = await DBConnect.query({ text, values: [userIds] })
      return result.rows.map(({ application_id }: { application_id: number }) => application_id)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getApplicationsFromUserPermissions: async (userIds: number[]) => {
    const text = `SELECT DISTINCT app.id
      FROM public.permissions_all perm
      JOIN application app ON perm."templateId" = app.template_id
      WHERE "userId" = ANY($1)
      AND "permissionType" = ANY('{REVIEW, ASSIGN}')
      AND app.outcome = 'PENDING'
    `
    try {
      const result = await DBConnect.query({ text, values: [userIds] })
      return result.rows.map(({ id }: { id: number }) => id)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
