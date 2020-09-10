const fetch = require('node-fetch');

const graphQLendpoint = 'http://localhost:5000/graphql';

const queries = [
  // Template A -- User Registration
  `    mutation {
        createTemplateVersion(
          input: {
            templateVersion: {
              isCurrent: true
              number: 1
              timeCreated: "NOW();"
              templatesUsingId: {
                create: {
                  templateName: "User Registration"
                  code: "UserRego1"
                  templateSectionsUsingId: {
                    create: [
                      {
                        code: "S1"
                        title: "Section 1"
                        templateElementsUsingId: {
                          create: [
                            {
                              code: "GS1"
                              nextElementCode: "Q1"
                              title: "Group 1"
                              elementTypePluginCode: "group_start"
                              visibilityCondition: { value: true }
                              category: INFORMATION
                              parameters: "{}"
                            }
                            {
                              code: "Q1"
                              nextElementCode: "Q2"
                              title: "First Name"
                              elementTypePluginCode: "short_text"
                              visibilityCondition: { value: true }
                              category: QUESTION
                              isRequired: true
                              isEditable: true
                              parameters: { label: "First Name" }
                            }
                            {
                              code: "Q2"
                              nextElementCode: "GE1"
                              title: "Surname"
                              elementTypePluginCode: "drop_down"
                              visibilityCondition: { value: true }
                              category: QUESTION
                              isRequired: true
                              isEditable: true
                              parameters: { label: "Last Name" }
                            }
                            {
                              code: "GE1"
                              nextElementCode: "BR1"
                              title: "Group 1"
                              elementTypePluginCode: "group_end"
                              visibilityCondition: { value: true }
                              category: INFORMATION
                              parameters: {}
                            }
                            {
                              code: "BR1"
                              nextElementCode: "Q3"
                              title: "Page 1"
                              elementTypePluginCode: "page_break"
                              visibilityCondition: { value: true }
                              category: INFORMATION
                              parameters: {}
                            }
                            {
                              code: "Q3"
                              title: "Company"
                              elementTypePluginCode: "drop_down"
                              visibilityCondition: { value: true }
                              category: QUESTION
                              isRequired: true
                              isEditable: true
                              parameters: {
                                label: "Select your Company"
                                options: ["Company A", "Company B"]
                              }
                            }
                          ]
                        }
                      }
                      { code: "S2", title: "Section 2" }
                    ]
                  }
                }
              }
            }
          }
        ) {
          templateVersion {
            number
            templatesByVersionId {
              nodes {
                code
                templateName
                templateSections {
                  nodes {
                    code
                    title
                    templateElementsBySectionId {
                      nodes {
                        code
                        visibilityCondition
                        parameters
                        title
                        category
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
  // Template B - Company Registration
  `mutation {
        createTemplateVersion(
          input: {
            templateVersion: {
              isCurrent: true
              number: 1
              timeCreated: "NOW();"
              templatesUsingId: {
                create: {
                  templateName: "Company Registration"
                  code: "CompRego1"
                  templateSectionsUsingId: {
                    create: [
                      {
                        code: "S1"
                        title: "Section 1"
                        templateElementsUsingId: {
                          create: [
                            {
                              code: "GS1"
                              nextElementCode: "Q1"
                              title: "Group 1"
                              elementTypePluginCode: "group_start"
                              visibilityCondition: { value: true }
                              category: INFORMATION
                              parameters: "{}"
                            }
                            {
                              code: "Q1"
                              nextElementCode: "Q2"
                              title: "Organisation Name"
                              elementTypePluginCode: "short_text"
                              visibilityCondition: { value: true }
                              category: QUESTION
                              isRequired: true
                              isEditable: true
                              parameters: { label: "Unique Name for Company" }
                            }
                            {
                              code: "Q2"
                              nextElementCode: "GE1"
                              title: "Organisation Activity"
                              elementTypePluginCode: "drop_down"
                              visibilityCondition: { value: true }
                              category: QUESTION
                              isRequired: true
                              isEditable: true
                              parameters: {
                                label: "Select type of activity"
                                options: ["Manufacturer", "Importer", "Producer"]
                              }
                            }
                            {
                              code: "GE1"
                              title: "Group 1"
                              elementTypePluginCode: "group_end"
                              visibilityCondition: { value: true }
                              category: INFORMATION
                              parameters: {}
                            }
                          ]
                        }
                      }
                      { code: "S2", title: "Section 2" }
                      { code: "S3", title: "Section 3" }
                    ]
                  }
                }
              }
            }
          }
        ) {
          templateVersion {
            number
            templatesByVersionId {
              nodes {
                code
                templateName
                templateSections {
                  nodes {
                    code
                    title
                    templateElementsBySectionId {
                      nodes {
                        code
                        visibilityCondition
                        parameters
                        title
                        category
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`,
  //   Add some users
  `mutation {
        createUser(
          input: {
            user: { email: "nicole@sussol.net", password: "1234", username: "nmadruga", role: APPLICANT }
          }
        ) {
          user {
            email
            password
            username
          }
        }
      }`,
  `
            mutation {
        createUser(
          input: {
            user: { email: "carl@sussol.net", password: "1234", username: "carl", role: APPLICANT }
          }
        ) {
          user {
            email
            password
            username
          }
        }
      }`,
  `      
      mutation {
        createUser(
          input: {
            user: { email: "andrei@sussol.net", password: "1234", username: "andrei", role: APPLICANT }
          }
        ) {
          user {
            email
            password
            username
          }
        }
      }`,
  `      
      mutation {
        createUser(
          input: {
            user: { email: "valerio@nra.org", password: "1234", username: "valerio", role: REVIEWER }
          }
        ) {
          user {
            email
            password
            username
          }
        }
      }`,
];

queries.forEach((query) => {
  fetch(graphQLendpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: query,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log('Added to database:', JSON.stringify(data)));
});
