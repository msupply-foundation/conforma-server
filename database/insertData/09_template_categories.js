/*
Template Filters, joined to all templates
*/
exports.queries = [
  `mutation devCategory {
  createTemplateCategory(
    input: {
      templateCategory: {
        code: "dev"
        icon: "code"
        templatesUsingId: { connectByCode: [{ code: "Demo" }, { code: "ReviewTest" }, ] }
        title: "Dev"
      }
    }
  ) {
    clientMutationId
  }
}
`,
  `mutation orgCategory {
  createTemplateCategory(
    input: {
      templateCategory: {
        code: "org"
        icon: "building"
        templatesUsingId: { connectByCode: [{ code: "OrgRegistration" }, { code: "OrgJoin" }, ] }
        title: "Organisation"
      }
    }
  ) {
    clientMutationId
  }
}
`,
  `mutation drugRegoCategory {
  createTemplateCategory(
    input: {
      templateCategory: {
        code: "drugRego"
        icon: "pills"
        templatesUsingId: { connectByCode: [{ code: "DrugRegoGen" } ] }
        title: "Drug Registration"
      }
    }
  ) {
    clientMutationId
  }
}`,
  `mutation userCategories {
  createTemplateCategory(
    input: {
      templateCategory: {
        code: "user"
        icon: "user"
        templatesUsingId: { connectByCode: [{ code: "UserEdit" } ] }
        title: "Drug Registration"
      }
    }
  ) {
    clientMutationId
  }
}`,
]
