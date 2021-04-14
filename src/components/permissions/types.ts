import { PermissionPolicyType, PermissionsAll } from '../../generated/graphql'

type PermissionTypes = keyof typeof PermissionPolicyType

// AllPermission generated type has permissionType as PermissionPolicyType, which won't be assignable
// to PermissionTypes, thus below declaration
type PermissionRow = Omit<PermissionsAll, 'permissionType'> & { permissionType: PermissionTypes }

interface TemplatePermissions {
  [index: string]: Array<PermissionTypes>
}

interface UserInfo {
  userId: number
  username: string
}

interface RuleType {
  for: string
  using: boolean
  withCheck: boolean
}

interface RuleTypes {
  [index: string]: RuleType
}

export { PermissionTypes, PermissionRow, TemplatePermissions, UserInfo, RuleTypes }
