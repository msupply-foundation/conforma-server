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
                id: 1007
                code: "S1"
                title: "Product Information"
                index: 0
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S1Info1"
                      index: 0
                      title: "General information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "Start application, by providing the product **NAME** and **ORIGIN**"
                      }
                    }
                    {
                      code: "S1Q1"
                      index: 10
                      title: "Product name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Product name" }
                    }
                    {
                      code: "S1Q2"
                      index: 20
                      title: "Origin category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Product origin"
                        description: "_Select which is the origin of the drug._"
                        options: ["Domestic", "Imported"]
                        default: 0
                      }
                    }
                    {
                      code: "S1PB1"
                      index: 30
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1Info2"
                      index: 40
                      title: "Universal code"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information for **USAGE**"
                      }
                    }
                    {
                      code: "S1Q3"
                      index: 50
                      title: "ATC Code"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "ATC Code (TODO: Replace with API using UC)"
                      }
                      isRequired: false
                    }
                    {
                      code: "S1Q4"
                      index: 60
                      title: "Generic name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Generic name (TODO: Replace with API using UC)"
                      }
                      isRequired: false
                    }
                    {
                      code: "S1Q5"
                      index: 70
                      title: "Therapeutic class"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Therapeutic class (TODO: Replace with API using UC)"
                      }
                      isRequired: false
                    }
                    {
                      code: "S1Q6"
                      index: 80
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
                      isRequired: false
                    }
                    {
                      code: "S1PB2"
                      index: 90
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1Info4"
                      index: 100
                      title: "Prescription/OTC information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information about **PRESCRIPTION**"
                      }
                    }
                    {
                      code: "S1Q7"
                      index: 110
                      title: "Prescriptions/OTC - code"
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
                      code: "S1Q9"
                      index: 120
                      title: "Strength"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Strength"
                      }
                    }
                    {
                      code: "S1Q10"
                      index: 130
                      title: "Route of administration"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Route of administration (Replace with Lookup table)"
                      }
                    }
                    {
                      code: "S1PB3"
                      index: 140
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1Info5"
                      index: 150
                      title: "Container information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information about **CONTAINER**"
                      }
                    }
                    {
                      code: "S1Q11"
                      index: 160
                      title: "Primary container"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Primary container"
                      }
                    }
                    {
                      code: "S1Q12"
                      index: 170
                      title: "Packaging and number of units"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Packaging and number of units"
                      }
                    }
                    {
                      code: "S1PB4"
                      index: 180
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1Info6"
                      index: 190
                      title: "Dosage information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information about **DOSAGE**"
                      }
                    }
                    {
                      code: "S1Q13"
                      index: 200
                      title: "Administration unit"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Administration unit"
                        options: [
                          "1. Same as dosage form (e.g. tablet, capsule)",
                          "2. Same as primary container (e.g. ampoule, vial, sachet)",
                          "3. Liquid or reconstituted preparation (e.g. oral solution, dry syrup, large volume injectable solution)",
                          "4. Semisolid (e.g. cream)",
                          "5. Other, specify below"
                        ]
                      }
                    }
                    {
                      code: "S1Q14"
                      index: 210
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
                      code: "S1Q15"
                      index: 220
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
                      code: "S1Q16"
                      index: 230
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
                      code: "S1Q17"
                      index: 240
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
                      code: "S1Q18"
                      index: 250
                      title: "Number of grams per pack"
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
                          { value: 3 }
                        ]
                      }
                    }
                    {
                      code: "S1Q19"
                      index: 260
                      title: "Specify administration unit"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Specify administration unit"
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
                      code: "S1Q20"
                      index: 270
                      title: "Number of (specify) per pack"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: {
                          operator: "stringSubstitution"
                          children: [
                            "Number of (%1) per pack"
                            {
                              operator: "objectProperties"
                              children: ["responses.S1Q19.text", "other"]
                            }
                          ]
                        }
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
                      code: "S1PB5"
                      index: 280
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1Info7"
                      index: 290
                      title: "Optinal information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "Optinal information"
                      }
                    }
                    {
                      code: "S1Q21"
                      index: 300
                      title: "Shelf life (months)"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Shelf life (months)"
                      }
                      isRequired: false
                    }
                    {
                      code: "S1Q22"
                      index: 310
                      title: "Comments"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Comments"
                      }
                      isRequired: false
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
                      code: "S2Q1"
                      index: 1
                      title: "File upload: Ingredients"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload ingredients list"
                        description: "Only 1 file allowed, no other restrictions"
                        fileExtensions: ["pdf", "doc", "docx", "xls"]
                        fileCountLimit: 1
                      }
                    }
                  ]
                }
              }
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