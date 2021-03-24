/*
TEMPLATE E - Drug Resgistration (Generic Medicines Procedure - simple version)
  - a simple template with first page and upload documents to be used in demo
    for testing the main Drug registation application and review process
*/
const { coreActions } = require('./core_actions')

exports.queries = [
  `mutation {
    createTemplate(
      input: {
        template: {
          code: "DrugRegoGen"
          name: "Drug Registration - General Medicines Procedure"
          status: AVAILABLE
          startMessage: "## You will need the following documents ready for upload:\\n- Ingredients\\n- Samples\\n- Product images"
          versionTimestamp: "NOW()"
          # templateCategoryToTemplateCategoryId: {
          #  create: { icon: "pills", id: 5001, title: "Drug Registration" }
          # }
          templateSectionsUsingId: {
            create: [
              {
                id: 1009
                code: "S3"
                title: "Product images"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S3Q1"
                      index: 0
                      title: "File upload: Samples"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload samples"
                        description: "Maximum of 5 files allowed, no other restrictions"
                        fileExtensions: ["pdf", "png", "jpg", "jpeg"]
                        fileCountLimit: 5
                      }
                    }
                    {
                      code: "S3PB1"
                      index: 1
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S3Q2"
                      index: 2
                      title: "File upload: Product images"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload product images"
                        description: "Maximum of 5 files allowed, no other restrictions"
                        fileExtensions: ["pdf", "png", "jpg", "jpeg"]
                        fileCountLimit: 5
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
                id: 8
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
              }
              {
                id: 9
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
              }
              {
                id: 10
                number: 3
                title: "Final Decision"
                description: "This is the final step and will change the outcome of this applications."
              }
            ]
          }
          templateActionsUsingId: {
            create: [
              ${coreActions}
              {
                actionCode: "cLog"
                trigger: ON_APPLICATION_SUBMIT
                parameterQueries: { message: "Application Submitted" }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              # Apply General
              { permissionNameId: 10100 }
              # Review Drug Registration Stage 1
              { permissionNameId: 10300, restrictions: {canSelfAssign: true}, level: 1, stageNumber: 1 }
              # Assign Drug Registration Stage 2
              { permissionNameId: 10200, level: 1, stageNumber: 2 }
              # Review Drug Registeation Stage 2 
              { permissionNameId: 10400, level: 1, stageNumber: 2 }
             
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