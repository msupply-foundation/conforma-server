module.exports['grantPermissions'] = async function (
  { username, userOrgId, permissionNames }: any,
  DBConnect: any
) {
  try {
    console.log('\nGranting permission/s:')
    console.log({ username, permissionNames })

    const currentUserPermisionsNames = (await DBConnect.getUserPermissionNames(username)).map(
      ({ name }: any) => name
    )

    for (const permissionName of permissionNames) {
      if (currentUserPermisionsNames.includes(permissionName)) continue
      await DBConnect.joinPermissionNameToUser(username, permissionName)
      currentUserPermisionsNames.push(permissionName)
    }
    return {
      status: 'Success',
      error_log: '',
    }
  } catch (error) {
    console.log(error)
    return {
      status: 'Fail',
      error_log: 'There was a problem in grantPermissions Plugin',
    }
  }
}
