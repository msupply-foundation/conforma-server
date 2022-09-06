import DBConnect from '../../databaseConnect'

const databaseMethods = {
  // Gets the application/template info of the "config" application associated with the template
  // specified by "templateCode". If multiple versions of the template exist, it
  // will use the one marked "AVAILABLE" or, if none are available, the highest
  // version number.
  getConfigApplicationInfo: async (templateCode: string) => {
    const text = `
    WITH available_count AS (
      SELECT COUNT(*) FROM template
      WHERE code = $1
      AND status = 'AVAILABLE'
    )
    SELECT app.id as "applicationId", app.serial,
    app.template_id as "templateId", ts."sectionCodes"
    FROM application app
    JOIN (
      SELECT template_id, array_agg(code) as "sectionCodes" from template_section
      GROUP BY template_id
    ) ts
    ON ts.template_id = app.template_id
    WHERE is_config=true
    AND app.template_id = (
      SELECT id FROM template
      WHERE code = $1
      AND CASE
        WHEN (SELECT count FROM available_count) = 0 THEN version = (
        SELECT MAX(version) from template
        WHERE code = $1
      ) ELSE status = 'AVAILABLE'
      END
    )`
    try {
      const result = await DBConnect.query({ text, values: [templateCode] })
      return result.rows[0] ?? {}
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getSingleReviewAssignment: async (assignmentId: number) => {
    const text = `
      SELECT id, allowed_sections AS "allowedSections"
      FROM review_assignment WHERE id = $1
    `
    try {
      const result = await DBConnect.query({ text, values: [assignmentId] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  // Gets all the review assignments for the specified application at the
  // highest possible stage and review_level
  getReviewAssignments: async (applicationId: number) => {
    const text = `
      WITH max_stage AS (
        SELECT MAX(stage_number) FROM review_assignment
        WHERE application_id = $1
      ), max_review_level AS (
        SELECT MAX(level_number) FROM review_assignment
        WHERE application_id = $1
        AND stage_number = (SELECT max FROM max_stage)
      )
      SELECT id, allowed_sections FROM public.review_assignment
      where application_id = $1
      AND stage_number = (SELECT max FROM max_stage)
      AND level_number = (SELECT max FROM max_review_level)
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationId] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  assignReview: async ({ id, allowedSections }: { id: number; allowedSections: string[] }) => {
    const text = `
      UPDATE review_assignment SET status = 'ASSIGNED', assigned_sections = $1
      WHERE id = $2;
    `
    try {
      const result = await DBConnect.query({ text, values: [allowedSections, id] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },

  createReview: async (id: number) => {
    const text = `
      INSERT INTO review (review_assignment_id) VALUES($1)
      returning id;
    `
    try {
      const result = await DBConnect.query({ text, values: [id] })
      return result.rows[0]
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
}

export default databaseMethods
