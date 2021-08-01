/*
TEMPLATE - Renewal (testing)
  - testing template for renewing the product created in template_D - Basic Review Test
  - should prolong the expiry event set by that template if renewal is successful
*/
const { coreActions, joinFilters } = require('../_helpers/core_mutations')
const { devActions } = require('../_helpers/dev_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "RenewTest"
          name: "Test -- Renewal Process"
          namePlural: "Test -- Renewals"
          status: AVAILABLE
          startMessage: "## Product renewal demonstration\\nOnly use this if your product has not yet expired. If it has expired, you'll need to reapply as a new product."
          submissionMessage: "Thanks, your product has been renewed."
          versionTimestamp: "NOW()"
          templateSectionsUsingId: {
            create: [
              {
                code: "S1"
                title: "Renewal info"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "Q1"
                      index: 1
                      title: "Select product"
                      elementTypePluginCode: "search"
                      category: QUESTION
                      parameters: {
                        label: "Product to renew"
                        description: "Please start typing the name of the product you wish to renew"
                        source: {
                          operator: "graphQL",
                          children: [
                            "query GetProducts($product: String!) {products(filter: { name: { includesInsensitive: $product }, expiryDate: { greaterThan: \\"now()\\" } }) {nodes {name, type, serial }}}",
                            "graphQLEndpoint",
                            [
                              "product"
                            ],
                            {
                              operator: "objectProperties",
                              children: [
                                "search.text"
                              ]
                            },
                            "products.nodes"
                          ]
                        }
                      }
                      helpText: "Only non-expired products will show in the search results"
                    }
                  ]
                }
              }
            ]
          }
          templateStagesUsingId: {
            create: [
              {
                number: 1
                title: "Automatic"
                description: "Once you submit this, the product will automatically be renewed"
                colour: "#24B5DF" #teal blue
              }
            ]
          }
          templateCategoryToTemplateCategoryId: { connectByCode: { code: "dev" } }
          ${joinFilters}
          templateActionsUsingId: {
            create: [
              ${coreActions}
              ${devActions}
              # ON_APPLICATION_SUBMIT:
              # - Update Product record (and app join)
              # - Set new expiry
              {
                actionCode: "modifyRecord"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 101
                parameterQueries: {
                  tableName: "product"
                  expiry_date: {
                    operator: "objectFunctions"
                    children: [
                      "functions.generateExpiry"
                      { minute: 5 }
                    ]
                  }
                  matchField: "serial"
                  matchValue: {
                    # ugly hack to get value from array
                    type: "string",
                    operator: "+",
                    children: [
                      {
                        operator: "objectProperties",
                        children: [
                          "applicationData.responses.Q1.selection.serial"
                        ]
                      },
                      ""
                    ]
                  }
                }
              }
              {
                actionCode: "scheduleAction"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 102
                parameterQueries:{
                  eventCode: "prod_exp1"
                  duration: { minute: 10 }
                }
              }
              {
                actionCode: "sendNotification"
                trigger: ON_SCHEDULE
                eventCode: "prod_exp1"
                condition: {
                  operator: "=",
                  children: [
                    {
                      operator: "graphQL",
                      children: [
                        "query CheckExpired($id: Int!) {products(filter: {id: {equalTo: $id}, expiryDate: {lessThan: \\"now()\\"}}) {totalCount}}",
                        "graphQLEndpoint",
                        [
                          "id"
                        ],
                        {
                          operator: "objectProperties",
                          children: [
                            "outputCumulative.product.id"
                          ]
                        },
                        "products.totalCount"
                      ]
                    },
                    1
                  ]
                }
                parameterQueries: {
                  fromName: "Application Manager"
                  fromEmail: "no-reply@sussol.net"
                  email: {
                    operator: "objectProperties"
                    children: ["applicationData.email", ""]
                  }
                  subject: {
                    operator: "stringSubstitution"
                    children: [
                      "Your product %1 has expired",
                      {
                        operator: "objectProperties"
                        children: [ "outputCumulative.product.name", ""]
                      }
                    ]
                  }
                  message: "Your product registration has expired. If you wish to continue, you'll need to re-apply.\\n(Note: this is just a test to check the notification worked. Nothing proper has actually changed)"
                }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
            ]
          }
        }
      }
    ) {
      template {
        code
        name
      }
    }
  }`,
]
