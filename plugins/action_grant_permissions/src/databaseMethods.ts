const databaseMethods = (DBConnect: any) => ({
  getUserIdFromUsername: async (username: string | null) => {
    if (username === null) return null
    const text = `SELECT id FROM "user" WHERE username = $1`
    try {
      const result = await DBConnect.query({ text, values: [username] })
      return result.rows[0]?.id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getOrgIdFromOrgname: async (orgname: string | null) => {
    if (orgname === null) return null
    const text = `SELECT id FROM organisation WHERE name = $1`
    try {
      const result = await DBConnect.query({ text, values: [orgname] })
      return result.rows[0]?.id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  getPermissionIdsFromNames: async (permissionNames: string[]) => {
    const text = `
      SELECT id, name FROM permission_name
      WHERE name = ANY($1)
      `
    try {
      const result = await DBConnect.query({ text, values: [permissionNames] })
      return result.rows
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },

  joinPermissionToUserOrg: async (userId: number, orgId: number, permissionId: number) => {
    const text = `
    INSERT INTO permission_join (user_id, organisation_id, permission_name_id) 
    VALUES ( $1, $2, $3 )
    ON CONFLICT (user_id, organisation_id, permission_name_id)
      WHERE organisation_id IS NOT NULL
    DO
    		UPDATE SET (user_id, is_active) = ( $1, true)
    RETURNING id
    `
    try {
      const result = await DBConnect.query({ text, values: [userId, orgId, permissionId] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  joinPermissionToUser: async (userId: number, permissionId: number) => {
    const text = `
    INSERT INTO permission_join (user_id, permission_name_id) 
    VALUES ( $1, $2 )
    ON CONFLICT (user_id, permission_name_id)
      WHERE organisation_id IS NULL
    DO
    		UPDATE SET (user_id, is_active) = ( $1, true )
    returning id
    `
    try {
      const result = await DBConnect.query({ text, values: [userId, permissionId] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
  joinPermissionToOrg: async (orgId: number, permissionId: number) => {
    const text = `
    INSERT INTO permission_join (organisation_id, permission_name_id) 
    VALUES ( $1, $2 )
    ON CONFLICT (organisation_id, permission_name_id)
      WHERE user_id IS NULL
    DO
    		UPDATE SET (organisation_id, is_active) = ( $1, true )
    returning id
    `
    try {
      const result = await DBConnect.query({ text, values: [orgId, permissionId] })
      return result.rows[0].id
    } catch (err) {
      console.log(err.message)
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
