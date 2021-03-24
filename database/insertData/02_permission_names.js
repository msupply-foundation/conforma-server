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
          name: "reviewReviewTestScreeningSection1", permissionPolicyId: 3000 }
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
          id: 5001
          name: "reviewReviewTestScreeningSection2", permissionPolicyId: 3000 }
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
          name: "reviewReviewTestAssessmentLvl1", permissionPolicyId: 3000 }
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
          id: 6001
          name: "reviewReviewTestAssessmentLvl2", permissionPolicyId: 3000 }
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
          name: "reviewReviewTestApproval", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewJoinCompany
  `mutation reviewJoinCompanyPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 8000
          name: "reviewJoinCompany", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // assignGeneral (associated with multiple templates)
  `mutation assignGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 9000
          name: "assignGeneral", permissionPolicyId: 4000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewGeneral (associated with multiple templates)
  `mutation reviewGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 10000
          name: "reviewGeneral", permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyGeneral (associated with multiple templates)
  `mutation assignGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 10100
          name: "applyGeneral",  permissionPolicyId: 2000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // Drug Registration permissions
  `mutation assignDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 10200
          name: "canAssignDrugRego",  permissionPolicyId: 4000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewScreenDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 10300
          name: "canScreenDrugRego",  permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  `mutation reviewAssessDrugRegoPermission {
    createPermissionName(
      input: {
        permissionName: { 
          id: 10400
          name: "canAssessDrugRego",  permissionPolicyId: 3000 }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
]
