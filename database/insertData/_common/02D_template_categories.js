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
        title: "User settings"
      }
    }
  ) {
    clientMutationId
  }
}`,
]
