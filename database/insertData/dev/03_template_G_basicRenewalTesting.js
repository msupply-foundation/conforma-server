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
          startMessage: "## No documents required, this is meant to be a fast process"
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
                            "query GetProducts($product: String!) {products(filter: { name: { includesInsensitive: $product } }) {nodes {name, type, serial }}}",
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
              # - Cancel previous expiry
              # - Update Product record (and app join)
              # - Set new expiry?
              {
                actionCode: "scheduleAction"
                trigger: ON_APPLICATION_SUBMIT
                sequence: 100
                parameterQueries:{
                  applicationId: {
                    operator: "objectProperties"
                    children: [
                      "outputCumulative.scheduledEvent.applicationId"
                    ]
                  }
                  eventCode: "prod_exp1"
                  cancel: true
                }
              }
#              {
#                actionCode: "modifyRecord"
#                trigger: ON_APPLICATION_SUBMIT
#                sequence: 101
#                parameterQueries: {
#                  tableName: "product"
#                  # We don't have a way to generate this yet!
#                  expiry_date: "31/01/2023"
#                  matchField: "serial"
#                  matchValue: {
#                    operator: "objectProperties"
#                    children: [ "outputCumulative.product.serial" ]
#                  }
#                }
#              }
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
