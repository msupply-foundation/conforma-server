exports.queries = [
  `mutation reviewJoinCompanyPermission {
    createPermissionName(
      input: {
        permissionName: {
          name: "reviewJoinCompany"
          permissionPolicyId: 3000
          id: 6000
        }
      }
    ) {
      clientMutationId
    }
  }`,
]
