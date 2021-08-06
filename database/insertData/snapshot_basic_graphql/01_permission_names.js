/*
Basic permissionNames, and associate with policies 
*/
exports.queries = [
  // admin user
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "admin"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "admin" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyUserRegistration
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: {
          name: "applyUserRegistration"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyNonRegistered" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // applyGeneral (associated with multiple templates)
  `mutation applyGeneralPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "applyGeneral",  permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "applyUserRestricted" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewOrgRego
  `mutation reviewOrgRegoPermission {
    createPermissionName(
      input: {
        permissionName: {
          name: "reviewOrgRego"
          permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // reviewJoinOrg
  `mutation reviewJoinOrgPermission {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewJoinOrg", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewOrgRestricted" }
          }
        }
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
          name: "assignGeneral", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "assignBasic" }
          }
        }
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
          name: "reviewGeneral", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
  // review permissions specific to each stage/level/sections
  `mutation createPermissionName {
    createPermissionName(
      input: {
        permissionName: { 
          name: "reviewScreening", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
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
          name: "reviewAssessmentSection1Level1", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
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
          name: "reviewAssessmentSection2Level1", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
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
          name: "reviewAssessmentLevel2", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewBasic" }
          }
        }
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
          name: "reviewFinalDecision", permissionPolicyToPermissionPolicyId: {
            connectByName: { name: "reviewAdvanced" }
          }
        }
      }
    ) {
      permissionName {
        name
      }
    }
  }`,
]
