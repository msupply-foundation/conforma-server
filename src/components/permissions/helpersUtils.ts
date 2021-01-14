import { PermissionRow } from './types'

// in { permissionPolicyId: 1, permissionNameId:2 }
// out "pp1pn2"
const getPermissionNameAbbreviation = ({ permissionPolicyId, permissionNameId }: PermissionRow) =>
  `pp${permissionPolicyId}pn${permissionNameId}`

// in { permissionPolicyId: 1, permissionNameId:2, templatePermissionId: 3 }
// out "pp1pn2tp3"
const getTemplatePermissionAbbreviation = (permissionRow: PermissionRow) =>
  `${getPermissionNameAbbreviation(permissionRow)}tp${permissionRow.templatePermissionId}`

// Returns new version of object with each key prefixed with prefix (and value converter to string)
// in "prefixMe", { one: 1, two: 2}
// out { prefixMe_one: "1", prefixMe_two: "2" }
const remapObjectKeysWithPrefix = (prefix: string, object: Object) => {
  const remappedObject: { [index: string]: string } = {}

  Object.entries(object).forEach(([key, value]) => {
    remappedObject[`${prefix}_${key}`] = String(value)
  })

  return remappedObject
}

export {
  getPermissionNameAbbreviation,
  getTemplatePermissionAbbreviation,
  remapObjectKeysWithPrefix,
}
