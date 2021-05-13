/*
Basic Permission Policies 
*/
exports.queries = [
  // applyNonRegistered -- used for UserRegistration
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "applyNonRegistered"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                session_id: "jwtUserDetails_text_sessionId"
                user_id: 1
              }
              # TO-DO: Add CREATE and UPDATE restrictions
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
  // applyUserRestricted
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "applyUserRestricted"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                user_id: "jwtUserDetails_bigint_userId"
              }
              # TO-DO: Add CREATE and UPDATE restrictions
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
  // applyOrgRestricted
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "applyOrgRestricted"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                org_id: "jwtUserDetails_bigint_orgId"
              }
              # TO-DO: Add CREATE and UPDATE restrictions
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
  // reviewOrgRestricted
  `mutation createPolicy {
    createPermissionPolicy(
      input: {
        permissionPolicy: {
          name: "reviewOrgRestricted"
          rules: {
            application: {
              view: {
                template_id: "jwtPermission_bigint_templateId"
                org_id: "jwtUserDetails_bigint_orgId"
              }
            }
            review: {
              view: {
                reviewer_id: "jwtUserDetails_bigint_userId"
              }
            }
            review_assignment: {
              view: {
                reviewer_id: "jwtUserDetails_bigint_userId"
              }
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
