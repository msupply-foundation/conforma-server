/*
Template Filters, joined to templates in individual templates
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
        }
      }
    ) {
      clientMutationId
    }
  }`,
]
