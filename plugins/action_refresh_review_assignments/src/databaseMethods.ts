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
    const text = `SELECT DISTINCT app.application_id
      FROM permissions_all perm
      JOIN application_stage_status_latest app
      ON perm."templateId" = app.template_id
      WHERE "userId" = ANY($1)
      AND "permissionType" = ANY('{REVIEW, ASSIGN}')
      AND app.outcome = 'PENDING'
    `
    // We should also exclude applications in DRAFT, but only when its a *first*
    // draft, so this check is done in `generateReviewAssignments` action
    try {
      const result = await DBConnect.query({ text, values: [userIds] })
      return result.rows.map(({ application_id }: { application_id: number }) => application_id)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getAllActiveApplications: async () => {
    const text = `SELECT application_id FROM
      application_stage_status_latest
      WHERE template_id IN (
        SELECT DISTINCT template.id
        FROM template JOIN template_stage ts
        ON template.id = template_id
        JOIN template_stage_review_level rl
        ON ts.id = rl.stage_id
      )
      AND outcome = 'PENDING'
      AND status <> 'DRAFT'
    `
    try {
      const result = await DBConnect.query({ text })
      return result.rows.map(({ application_id }: { application_id: number }) => application_id)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
