import { errorMessage } from '../../../src/components/utilityFunctions'

const databaseMethods = (DBConnect: any) => ({
  revokePermissionFromUser: async (
    userId: number,
    orgId: null | undefined,
    permissionIds: number[],
    isRemovingPermissions: boolean = true
  ) => {
    const text = `
      ${
        isRemovingPermissions
          ? 'DELETE FROM permission_join '
          : 'UPDATE permission_join SET is_active = false '
      } 
      WHERE user_id = $1
        AND permission_name_id = ANY($2)
        ${orgId === null ? 'AND organisation_id IS NULL' : ''}
      RETURNING
        id as "permissionJoinId",
        permission_name_id as "permissionNameId",
        (SELECT name FROM permission_name WHERE id = permission_name_id) as "permissionName"
      `
    try {
      const result = await DBConnect.query({ text, values: [userId, permissionIds] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  revokePermissionFromUserOrg: async (
    userId: number,
    orgId: number,
    permissionIds: number[],
    isRemovingPermissions: boolean = true
  ) => {
    const text = `
      ${
        isRemovingPermissions
          ? 'DELETE FROM permission_join '
          : 'UPDATE permission_join SET is_active = false '
      } 
      WHERE user_id = $1 AND organisation_id = $2
        AND permission_name_id = ANY($3)
      RETURNING
        id as "permissionJoinId",
        permission_name_id as "permissionNameId",
        (SELECT name FROM permission_name WHERE id = permission_name_id) as "permissionName"
      `
    try {
      const result = await DBConnect.query({ text, values: [userId, orgId, permissionIds] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
  revokePermissionFromOrg: async (
    orgId: number,
    userId: null | undefined,
    permissionIds: number[],
    isRemovingPermissions: boolean = true
  ) => {
    const text = `
      ${
        isRemovingPermissions
          ? 'DELETE FROM permission_join '
          : 'UPDATE permission_join SET is_active = false '
      } 
      WHERE organisation_id = $1
        AND permission_name_id = ANY($2)
        ${userId === null ? 'AND user_id IS NULL' : ''}
      RETURNING
        id as "permissionJoinId",
        permission_name_id as "permissionNameId",
        (SELECT name FROM permission_name WHERE id = permission_name_id) as "permissionName"
      `
    try {
      const result = await DBConnect.query({ text, values: [orgId, permissionIds] })
      return result.rows
    } catch (err) {
      console.log(errorMessage(err))
      throw err
    }
  },
})
export type DatabaseMethodsType = ReturnType<typeof databaseMethods>

export default databaseMethods
