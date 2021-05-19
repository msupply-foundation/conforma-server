/*
Template Filters, joined to templates in individual templates
*/
exports.queries = [
  // "Approved status" applications - APPLY
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

  // "Submitted status" applications - APPLY
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

  // "Draf status" applications - APPLY
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

  // "Changes requested" applications - APPLY
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

  // "Reviewer actions" on applications - REVIEW
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "user plus"
          code: "availableForSelfAssignmentReviews"
          query: { reviewerAction: "SELF_ASSIGN" }
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
          code: "readyToStartReviews"
          query: { reviewerAction: "START_REVIEW" }
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
          code: "readyToRestartReviews"
          query: { reviewerAction: "RESTART_REVIEW" }
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
          code: "draftReviews"
          query: { reviewerAction: "CONTINUE_REVIEW" }
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
          icon: "redo"
          code: "changeRequestReviews"
          query: { reviewerAction: "UPDATE_REVIEW" }
          title: "Changes Required"
          userRole: REVIEW
        }
      }
    ) {
      clientMutationId
    }
  }`,

  // "Assigner actions" on applications - ASSIGN
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          icon: "user plus"
          code: "awaitingAssignments"
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
          code: "availableForReAssignments"
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
