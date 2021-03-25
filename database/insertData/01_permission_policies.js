/*
Basic Permission Policies 
*/
exports.queries = [
  // oneTimeApply -- used for UserRegistration
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          id: 1000
          name: "oneTimeApply"
          rules: {
            application: {
              view: { template_id: "jwtPermission_bigint_templateId" }
            }
          }
          type: APPLY
        }
      }
    ) {
      permissionPolicy {
        name
      }
    }
  }`,
  // basicApply
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          id: 2000
          name: "basicApply"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                user_id: "jwtUserDetails_bigint_userId"
              }
            }
          }
          type: APPLY
        }
      }
    ) {
      permissionPolicy {
        name
      }
    }
  }`,
  // basicReview
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          id: 3000
          name: "basicReview"
          rules: {
            application: {
              view: { template_id: "jwtPermission_bigint_templateId" }
            }
          }
          type: REVIEW
        }
      }
    ) {
      permissionPolicy {
        name
      }
    }
  }`,
  // basicAssign
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          id: 4000
          name: "basicAssign"
          rules: {
            application: {
              view: { template_id: "jwtPermission_bigint_templateId" }
            }
          }
          type: ASSIGN
        }
      }
    ) {
      permissionPolicy {
        name
      }
    }
  }`,
]
