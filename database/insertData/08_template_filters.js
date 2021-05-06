/*
Template Filters, joined to all templates
*/
exports.queries = [
  // "Approved Applications" - APPLY
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "check circle"
          code: "approveApplications"
          query: { outcome: "APPROVED" }
          title: "Approved Applications"
          userRole: APPLY
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "arrow alternate circle right"
          code: "submittedApplications"
          query: { status: "submitted" }
          title: "Submitted Applications"
          userRole: APPLY
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "save"
          code: "draftApplications"
          query: { status: "draft" }
          title: "Draft Applications"
          userRole: APPLY
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "exchange"
          code: "changeRequestApplications"
          query: { status: "Changes Required" }
          title: "Changes Required"
          userRole: APPLY
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "user plus"
          code: "availableForSelfAssignment"
          query: { reviewAvailableForSelfAssignmentCount: "1:1000" }
          title: "Available For Self Assignment"
          userRole: REVIEW
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "gavel"
          code: "readyToReview"
          query: { reviewAssignedNotStartedCount: "1:1000" }
          title: "Ready to Review"
          userRole: REVIEW
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "exchange"
          code: "readyToReReview"
          query: { reviewPendingCount: "1:1000" }
          title: "Ready to Re-Review"
          userRole: REVIEW
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,

  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "save"
          code: "draftReview"
          query: { reviewDraftCount: "1:1000" }
          title: "Draft Reviews"
          userRole: REVIEW
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "user plus"
          code: "awaitingAssignment"
          query: { assignCount: "1:1000", isFullyAssignedLevel1: false}
          title: "Awaiting Assignment"
          userRole: ASSIGN
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "remove user"
          code: "reAssign"
          query: { assignCount: "1:1000", isFullyAssignedLevel1: true}
          title: "Re Assign"
          userRole: ASSIGN
          templateFilterJoinsUsingId: {
            create: [
              { templateToTemplateId: { connectByCode: { code: "Demo" } } }
              {
                templateToTemplateId: {
                  connectByCode: { code: "OrgRegistration" }
                }
              }
              {
                templateToTemplateId: {
                  connectByCode: { code: "UserRegistration" }
                }
              }
              { templateToTemplateId: { connectByCode: { code: "ReviewTest" } } }
              { templateToTemplateId: { connectByCode: { code: "DrugRegoGen" } } }
              { templateToTemplateId: { connectByCode: { code: "OrgJoin" } } }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }`,
]
