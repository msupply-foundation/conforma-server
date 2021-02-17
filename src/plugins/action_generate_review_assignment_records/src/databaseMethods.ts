const databaseMethods = (DBConnect: any) => ({
  getNumReviewLevels: async (templateId: number, stageNumber: number) => {
    const text = `
    SELECT MAX(level) FROM template_permission
    WHERE template_id = $1
    AND stage_number = $2
    `
    try {
      const result = await DBConnect.query({ text, values: [templateId, stageNumber] })
      return result.rows[0].max
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
