exports.queries = [
  `mutation reviewJoinCompanyPermission {
        __typename
        createPermissionName(
          input: {
            permissionName: { name: "reviewJoinCompany", permissionPolicyId: 3 }
          }
        ) {
          clientMutationId
        }
      }`,
]
