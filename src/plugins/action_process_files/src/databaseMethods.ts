const databaseMethods = (DBConnect: any) => ({
  getApplicationFiles: async (applicationSerial: string) => {
    const text = `
    SELECT
      unique_id AS "uniqueId",
      application_response_id AS "applicationResponseId",
      file_path AS "filePath",
      thumbnail_path AS "thumbnailPath"
    FROM file
    WHERE application_serial = $1
    AND submitted = false
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
      
    `
    try {
      const result = await DBConnect.query({
        text,
        values: [elementPluginCode, applicationId],
      })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})

export default databaseMethods
