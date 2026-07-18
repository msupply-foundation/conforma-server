import { errorMessage } from '../../../src/components/utilityFunctions'

const databaseMethods = (DBConnect: any) => ({
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
      console.log(errorMessage(err))
      throw err
    }
  },
})

export default databaseMethods
