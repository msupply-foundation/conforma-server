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
          startMessage: "## You will need the following documents ready for upload:\\n- Ingredients\\n- Samples\\n- Product images\\n- Indications"
          versionTimestamp: "NOW()"
          templateCategoryToTemplateCategoryId: {
            create: { icon: "pills", id: 5001, title: "Drug Registration" }
          }
          templateFilterJoinsUsingId: {
            create: [{
              filterToTemplateFilterId: {
                create: {
                  icon: "save"
                  code: "check"
                  query: { status: "submitted" }
                  title: "Applications Submitted"
                  userRole: "Apply"
                  color: "#003BFE"
                }
              }
            }
            {
              filterToTemplateFilterId: {
                create: {
                  icon: "info"
                  code: "check"
                  query: { stage: "Assessment" }
                  title: "Applications In Assessmet"
                  userRole: "Review"
                  color: "rgb(150, 150, 150)"
                }
              }
            }
            {
              filterToTemplateFilterId: {
                create: {
                  icon: "info circle"
                  code: "check"
                  query: { reviewAssignedNotStartedCount: "1:1000" }
                  title: "Reviews can be started"
                  userRole: "Review"
                  color: "#003BFE"
                }
              }
            }
            {
              filterToTemplateFilterId: {
                create: {
                  icon: "edit"
                  code: "check"
                  query: { reviewDraftCount: "1:1000" }
                  title: "Reviews in progress"
                  userRole: "Review"
                }
              }
            }]
          }
          templateSectionsUsingId: {
            create: [
              {
                id: 1007
                code: "S1"
                title: "Product Information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      id: 5000
                      code: "S1Info1"
                      index: 0
                      title: "Product information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require your **PRODUCT information**"
                      }
                    }
                    {
                      id: 5010
                      code: "S1Q1"
                      index: 10
                      title: "Product name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Product name" }
                    }
                    {
                      id: 5020
                      code: "S1Q2"
                      index: 20
                      title: "Origin category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Product origin"
                        description: "_Select which is the origin of the drug._"
                        options: ["Domestic", "Imported"]
                        validation: { value: true }
                        default: 0
                      }
                    }
                    {
                      id: 5030
                      code: "S1Q3"
                      index: 30
                      title: "ATC Code"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "ATC Code (TODO: Replace with API using UI)"
                      }
                    }
                    {
                      id: 5040
                      code: "S1Q4"
                      index: 40
                      title: "Generic name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Generic name"
                        text: {
                          operator: "stringSubstitution"
                          children: [
                            "%1"
                            {
                              operator: "objectProperties"
                              children: ["responses.Q2.text"]
                            }
                          ]
                        }
                      }
                    }
                    {
                      id: 5050
                      code: "S1Q5"
                      index: 50
                      title: "Therapeutic class"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Therapeutic class"
                      }
                    }
                    {
                      id: 5060
                      code: "S1Q6"
                      index: 60
                      title: "Formulations"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Formulations"
                        options: [
                          "All dosage form have the same formulation",
                          "This presentation has dosage forms with different formulations"
                        ]
                      }
                    }
                    {
                      id: 5090
                      code: "S1PB1"
                      index: 80
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 5070
                      code: "S1Q7"
                      index: 70
                      title: "Prescriptions/OTC - Code"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Prescriptions/OTC"
                        options: [
                          "HCD - Highly Controlled Medicine",
                          "LCD - Limited Controlled Medicine",
                          "OTC - Over The Counter Medicine",
                          "POM - Prescription Only Medicine",
                          "NA - UNASSIGNED"
                        ]
                      }
                    }
                    {
                      id: 5110
                      code: "S1Q9"
                      index: 110
                      title: "Strength"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Strength"
                      }
                    }
                    {
                      id: 5120
                      code: "S1Q10"
                      index: 120
                      title: "Route of administration"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Route of administration"
                      }
                    }
                    {
                      id: 5130
                      code: "S1Q11"
                      index: 130
                      title: "Primary container"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Primary container"
                      }
                    }
                    {
                      id: 5140
                      code: "S1Q12"
                      index: 140
                      title: "Packaging and number of units"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Packaging and number of units"
                      }
                    }
                    {
                      id: 5150
                      code: "S1Q13"
                      index: 150
                      title: "Administration unit"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "_Administration unit is_"
                        options: [
                          "1. Same as dosage form (e.g. tablet, capsule)",
                          "2. Same as primary container (e.g. ampoule, vial, sachet)",
                          "3. Liquid or reconstituted preparation (e.g. oral solution, dry syrup, large volume injectable solution)",
                          "4. Semisolid (e.g. cream)",
                          "5. Other, specify"
                        ]
                      }
                    }
                    {
                      id: 5160
                      code: "S1Q14"
                      index: 160
                      title: "Number of (dosage form)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Number of (dosage form) per pack"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q13.optionIndex"]
                          }
                          { value: 0 }
                        ]
                      }
                    }
                    {
                      id: 5170
                      code: "S1Q15"
                      index: 170
                      title: "Number of (primary container)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Number of (primary container) per pack"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q13.optionIndex"]
                          }
                          { value: 1 }
                        ]
                      }
                    }
                    {
                      id: 5180
                      code: "S1Q16"
                      index: 180
                      title: "Number of millilitres (primary container)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "If applicable (e.g. ampoule), number of millilitres per (primary container)"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q13.optionIndex"]
                          }
                          { value: 1 }
                        ]
                      }
                    }
                    {
                      id: 5190
                      code: "S1Q17"
                      index: 190
                      title: "Number of millilitres per primary container (as provided or after reconstitution)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Number of millilitres per primary container (as provided or after reconstitution)"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q13.optionIndex"]
                          }
                          { value: 2 }
                        ]
                      }
                    }
                    {
                      id: 5210
                      code: "S1Q20"
                      index: 210
                      title: "Other - specify"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Number of grams per pack"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q13.optionIndex"]
                          }
                          { value: 4 }
                        ]
                      }
                    }
                    {
                      id: 5220
                      code: "S1Q21"
                      index: 160
                      title: "Shelf life (months)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Shelf life (months)"
                      }
                    }
                    {
                      id: 5230
                      code: "S1Q22"
                      index: 170
                      title: "Comments"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Comments"
                      }
                    }
                  ]
                }
              }
              {
                id: 1008
                code: "S2"
                title: "Ingredients"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      id: 6000
                      code: "S2Info1"
                      index: 0
                      title: "Product Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require the INGREDIENTS for **Drug registered**"
                      }
                    }
                    {
                      id: 6010
                      code: "S2Q1"
                      index: 10
                      title: "File upload - ingredients"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload ingredients list"
                        description: "Only 1 file allowed, no other restrictions"
                        fileCountLimit: 1
                      }
                    }
                  ]
                }
              }
              {
                id: 1009
                code: "S3"
                title: "Images Uploads"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      id: 7000
                      code: "S3Info2"
                      index: 0
                      title: "Samples"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require the SAMPLES for **Drug registered**"
                      }
                    }
                    {
                      id: 7010
                      code: "S3Q1"
                      index: 10
                      title: "File upload - sample"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload samples"
                        description: "Only 1 file allowed, no other restrictions"
                        fileCountLimit: 5
                      }
                    }
                    {
                      id: 7020
                      code: "S3PB1"
                      index: 20
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      id: 7040
                      code: "S2Info3"
                      index: 30
                      title: "Product images"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require the PRODUCT IMAGES for **Drug registered**"
                      }
                    }
                    {
                      id: 7050
                      code: "S3Q2"
                      index: 40
                      title: "File upload - product images"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload product images"
                        description: "Only 1 file allowed, no other restrictions"
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
                sequence: 2
                parameterQueries: { message: "Application Submitted" }
              }
            ]
          }
          templatePermissionsUsingId: {
            create: [
              { permissionNameId: 54 }
              { permissionNameId: 55, restrictions: {canSelfAssign: true}, level: 1, stageNumber: 1 }
              { permissionNameId: 56, level: 1, stageNumber: 2 }
              { permissionNameId: 57, level: 1, stageNumber: 2 }
             
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
