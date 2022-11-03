const databaseMethods = (DBConnect: any) => ({
  getApplicationResponseFiles: async (applicationSerial: string) => {
    const text = `
    SELECT
      unique_id AS "uniqueId",
      application_response_id AS "applicationResponseId",
      file_path AS "filePath",
      thumbnail_path AS "thumbnailPath"
    FROM file
    WHERE application_serial = $1
    AND submitted = false
    AND application_response_id IS NOT NULL
    AND is_output_doc = false
    AND is_internal_reference_doc = false
    AND is_external_reference_doc = false
    `
    try {
      const result = await DBConnect.query({ text, values: [applicationSerial] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getFileResponses: async (applicationId: number, elementPluginCode: string) => {
    const text = `
    SELECT value
      FROM application_response
      WHERE template_element_id IN (
        SELECT id FROM template_element
        WHERE element_type_plugin_code = $1
      )
      AND application_id = $2
      AND value IS NOT NULL
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [elementPluginCode, applicationId],
      })
      return result.rows.map((row: any) => row.value)
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  deleteFileRecord: async (fileUniqueId: string) => {
    const text = `
    DELETE FROM file
    WHERE unique_id = $1
    RETURNING unique_id
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [fileUniqueId],
      })
      return result.rows[0].unique_id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  setFileSubmitted: async (fileUniqueId: string) => {
    const text = `
    UPDATE file
      SET submitted = true
      WHERE unique_id = $1
    RETURNING unique_id
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [fileUniqueId],
      })
      return result.rows[0].unique_id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
