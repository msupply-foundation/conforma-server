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
                template_id: "jwtPermission_array_bigint_template_ids"
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
                template_id: "jwtPermission_array_bigint_template_ids"
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
                template_id: "jwtPermission_array_bigint_template_ids"
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
                template_id: "jwtPermission_array_bigint_template_ids"
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
  // reviewBasic
  {
    query: `mutation createPolicy($rules: JSON) {
      createPermissionPolicy(
        input: {
          permissionPolicy: {
            name: "reviewBasic"
            rules: $rules
            type: REVIEW
          }
        }
      ) {
        permissionPolicy {
          name
        }
      }
    }`,
    variables: {
      rules: {
        application: {
          view: {
            template_id: 'jwtPermission_array_bigint_template_ids',
            id: {
              $in: {
                $select: {
                  application_id: true,
                  $from: 'review_assignment',
                  $where: {
                    reviewer_id: 'jwtUserDetails_bigint_userId',
                  },
                },
              },
            },
          },
        },
        review: {
          view: {
            application_id: {
              $in: {
                $select: {
                  application_id: true,
                  $from: 'review_assignment',
                  $where: {
                    reviewer_id: 'jwtUserDetails_bigint_userId',
                  },
                },
              },
            },
          },
        },
        review_assignment: {
          view: {
            reviewer_id: 'jwtUserDetails_bigint_userId',
          },
        },
      },
    },
  },
  // assignBasic
  {
    query: `mutation createPolicy($rules: JSON) {
      createPermissionPolicy(
        input: {
          permissionPolicy: {
            name: "assignBasic"
            rules: $rules
            type: ASSIGN
          }
        }
      ) {
        permissionPolicy {
          name
        }
      }
    }`,
    variables: {
      rules: {
        application: {
          view: {
            template_id: 'jwtPermission_array_bigint_template_ids',
          },
        },
        review: {
          view: {
            review_assignment_id: {
              $in: {
                $select: {
                  id: true,
                  $from: 'review_assignment',
                  $where: {
                    template_id: 'jwtPermission_array_bigint_template_ids',
                  },
                },
              },
            },
          },
        },
        review_assignment: {
          view: {
            template_id: 'jwtPermission_array_bigint_template_ids',
          },
        },
      },
    },
  },
  {
    query: `mutation createPolicy($rules: JSON) {
      createPermissionPolicy(
        input: {
          permissionPolicy: {
            name: "admin"
            rules: $rules
            type: APPLY
            isAdmin: true
          }
        }
      ) {
        permissionPolicy {
          name
        }
      }
    }`,
    variables: {
      rules: {
        application: {
          view: {
            template_id: { $gte: 0 },
          },
        },
      },
    },
  },
]
