/*
Basic Permission Policies 
*/
exports.queries = [
  // nonRegisteredApply -- used for UserRegistration
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "nonRegisteredApply"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                session_id: "jwtUserDetails_text_sessionId"
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
  // basicApply
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
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
