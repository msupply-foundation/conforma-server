const databaseMethods = (DBConnect: any) => ({
  revokePermissionFromUser: async (username: string, permissionNames: string[]) => {
    const text = `
      UPDATE permission_join SET is_active = false
      WHERE user_id = (
        SELECT id from "user" WHERE username = $1
      ) AND permission_name_id IN (
        SELECT id from permission_name WHERE name = ANY($2)
      ) AND organisation_id IS NULL
      RETURNING
        permission_name_id,
        (SELECT name FROM permission_name WHERE id = permission_name_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [username, permissionNames] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  revokePermissionFromUserOrg: async (
    username: string,
    org: string | number,
    permissionNames: string[]
  ) => {
    const text = `
      UPDATE permission_join SET is_active = false
      WHERE user_id = (
        SELECT id from "user" WHERE username = $1
      ) AND organisation_id = ${
        typeof org === 'number' ? '$2' : '(SELECT id FROM organisation WHERE name = $2)'
      } AND permission_name_id IN (
        SELECT id from permission_name WHERE name = ANY($3)
      ) 
      RETURNING
        permission_name_id,
        (SELECT name FROM permission_name WHERE id = permission_name_id)
      `
    try {
      const result = await DBConnect.query({ text, values: [username, org, permissionNames] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
