/*
Basic permissionNames, and associate with policies 
*/
exports.queries = [
  // applyUserRegistration
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 1000
          name: "applyUserRegistration", permissionPolicyId: 1000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyCompanyRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 2000
          name: "applyCompanyRego", permissionPolicyId: 2000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyReviewTest
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 3000
          name: "applyReviewTest", permissionPolicyId: 2000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewCompanyRego
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 4000
          name: "reviewCompanyRego", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewReviewTest
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 5000
          name: "reviewReviewTest Lvl1 (Stage 1, Stage 2)", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 6000
          name: "reviewReviewTest Lvl2 (Stage 2)", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          id: 7000
          name: "reviewReviewTest Lvl1 (Stage 3)", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
]
