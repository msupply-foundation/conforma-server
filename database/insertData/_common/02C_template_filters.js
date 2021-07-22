/*
Template Filters, joined to templates in individual templates
*/
exports.queries = [
  // "Approved status" applications - APPLY
  `mutation addFilter {
    createFilter(
      input: {
        filter: {
          code: "approveApplications"
          query: { outcome: "APPROVED" }
          title: "Approved applications"
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
          code: "submittedApplications"
          query: { status: "submitted" }
          title: "Submitted applications"
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
          code: "draftApplications"
          query: { status: "draft" }
          title: "Draft applications"
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
          code: "changeRequestApplications"
          query: { status: "Changes Required" }
          title: "Applications pending action"
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
          code: "availableForSelfAssignmentReviews"
          query: { reviewerAction: "SELF_ASSIGN" }
          title: "Applications available for self-assignment"
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
          code: "readyToStartReviews"
          query: { reviewerAction: "START_REVIEW" }
          title: "Applications pending review"
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
          code: "readyToRestartReviews"
          query: { reviewerAction: "RESTART_REVIEW" }
          title: "Applications with updates to review"
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
          code: "draftReviews"
          query: { reviewerAction: "CONTINUE_REVIEW" }
          title: "Draft reviews of applications"
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
          code: "changeRequestReviews"
          query: { reviewerAction: "UPDATE_REVIEW" }
          title: "Reviews pending action"
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
          code: "awaitingAssignments"
          query: { assignerAction: "ASSIGN" }
          title: "Reviews awaiting assignment"
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
          code: "availableForReAssignments"
          query: { assignerAction: "RE_ASSIGN" }
          title: "Reviews available for re-assignment"
          userRole: ASSIGN
        }
      }
    ) {
      clientMutationId
    }
  }`,
]
