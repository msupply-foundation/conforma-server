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
          isLinear: false
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
                      code: "S1TextPage1"
                      index: 0
                      title: "General information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "General information"
                        text: "Start application, by providing the product **NAME** and **ORIGIN**"
                      }
                    }
                    {
                      code: "S1Q1ProductName"
                      index: 10
                      title: "Product name"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: { label: "Product name" }
                      validation: {
                        operator: "AND"
                        children: [
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.Q1.text"]
                              }
                              { value: null }
                            ]
                          }
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.Q1.text"]
                              }
                              { value: "" }
                            ]
                          }
                        ]
                      }
                      validationMessage: "You need a valid product name."
                    }
                    {
                      code: "S1Q2Origin"
                      index: 20
                      title: "Origin category"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Product origin"
                        description: "_Select which is the origin of the drug._"
                        options: ["Domestic", "Imported"]
                      }
                    }
                    {
                      index: 21
                      code: "S1Q3GraphQL"
                      title: "Country code"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        search: true
                        options: {
                          operator: "graphQL",
                          children: [
                            "query countries { countries { code name } }"
                            "https://countries.trevorblades.com"
                            []
                            "countries"
                          ]
                        }
                        optionsDisplayProperty: "code"
                        placeholder: "Type one country code (2 digits)"
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q2Origin.text"]
                          }
                          "Imported"
                        ]
                      }
                    }
                    {
                      index: 22
                      code: "TextCountryName"
                      title: "Country Name"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q3GraphQL.selection.name"
                            ""
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.S1Q2Origin.text"]
                          }
                          "Imported"
                        ]
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
                      code: "S1TextPage2"
                      index: 40
                      title: "Universal code"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information about **PRODUCT**"
                      }
                    }
                    {
                      code: "S1Q4GraphQL"
                      index: 50
                      title: "UC Selector"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        search: true
                        options: {
                          operator: "graphQL",
                          children: [
                            "query GetAllProducts { entities( filter: {}, offset: 0, first: 1000) { data { code description type children { code description } properties { type value } } } }",
                            "https://codes.msupply.foundation:2048/graphql",
                            [],
                            "entities.data"
                          ]
                        }
                        optionsDisplayProperty: "description"
                        placeholder: "Type name of ATC  code"
                      }
                    }
                    {
                      code: "S1TextUC-code"
                      index: 60
                      title: "UC code"
                      elementTypePluginCode: "shortText"
                      isEditable: false
                      category: QUESTION
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [
                              "responses.S1Q4GraphQL"
                              ""
                            ]
                          }
                          null
                        ]
                      }
                      parameters: {
                        label: "mSupply UC - code"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q4GraphQL.selected.code"
                            ""
                          ]
                        }
                      }
                    }
                    {
                      code: "S1TextUC-Type"
                      index: 70
                      title: "UC - type"
                      elementTypePluginCode: "shortText"
                      isEditable: false
                      category: QUESTION
                      parameters: {
                        label: "Type"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q4GraphQL.selected.type"
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [
                              "responses.S1Q4GraphQL"
                            ]
                          }
                          null
                        ]
                      }
                    }
                    {
                      code: "S1TextUC-WHO"
                      index: 75
                      title: "UC - who"
                      elementTypePluginCode: "shortText"
                      isEditable: false
                      category: QUESTION
                      parameters: {
                        label: "Who code"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q4GraphQL.selected.children[1].code",
                            ""
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [
                              "responses.S1Q4GraphQL"
                              ""
                            ]
                          }
                          null
                        ]
                      }
                    }
                    {
                      code: "S1PB2"
                      index: 80
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1TextPage3"
                      index: 90
                      title: "Prescription/OTC information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require information about **PRESCRIPTION**"
                      }
                    }
                    {
                      code: "S1Q6"
                      index: 100
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
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Route of administration"
                        description: "To be replaced with Lookup table"
                        options: [
                          { "code": "2", "name": "BUCCAL" },
                          { "code": "3", "name": "CONJUNCTIVAL" },
                          { "code": "4", "name": "CUTANEOUS" },
                          { "code": "NA", "name": "Data not available" },
                          { "code": "5", "name": "DENTAL" },
                          { "code": "6", "name": "ELECTRO-OSMOSIS" },
                          { "code": "7", "name": "ENDOCERVICAL" },
                          { "code": "8", "name": "ENDOSINUSIAL" },
                          { "code": "9", "name": "ENDOTRACHEAL" },
                          { "code": "10", "name": "ENTERAL" },
                          { "code": "11", "name": "EPIDURAL" },
                          { "code": "12", "name": "EXTRA?AMNIOTIC" },
                          { "code": "13", "name": "EXTRACORPOREAL" },
                          { "code": "14", "name": "HEMODIALYSIS" },
                          { "code": "15", "name": "INFILTRATION" },
                          { "code": "16", "name": "INTERSTITIAL" },
                          { "code": "17", "name": "INTRA-ABDOMINAL" },
                          { "code": "18", "name": "INTRA-AMNIOTIC" },
                          { "code": "19", "name": "INTRA-ARTERIAL" },
                          { "code": "20", "name": "INTRA-ARTICULAR" },
                          { "code": "21", "name": "INTRABILIARY" },
                          { "code": "22", "name": "INTRABRONCHIAL" },
                          { "code": "23", "name": "INTRABURSAL" },
                          { "code": "24", "name": "INTRACARDIAC" },
                          { "code": "25", "name": "INTRACARTILAGINOUS" },
                          { "code": "26", "name": "INTRACAUDAL" },
                          { "code": "27", "name": "INTRACAVERNOUS" },
                          { "code": "28", "name": "INTRACAVITARY" },
                          { "code": "29", "name": "INTRACEREBRAL" },
                          { "code": "30", "name": "INTRACISTERNAL" },
                          { "code": "31", "name": "INTRACORNEAL" },
                          { "code": "32", "name": "INTRACORONAL, DENTAL" },
                          { "code": "33", "name": "INTRACORONARY" },
                          { "code": "34", "name": "INTRACORPORUS CAVERNOSUM" },
                          { "code": "35", "name": "INTRADERMAL" },
                          { "code": "36", "name": "INTRADISCAL" },
                          { "code": "37", "name": "INTRADUCTAL" },
                          { "code": "38", "name": "INTRADUODENAL" },
                          { "code": "39", "name": "INTRADURAL" },
                          { "code": "40", "name": "INTRAEPIDERMAL" },
                          { "code": "41", "name": "INTRAESOPHAGEAL" },
                          { "code": "42", "name": "INTRAGASTRIC" },
                          { "code": "43", "name": "INTRAGINGIVAL" },
                          { "code": "44", "name": "INTRAILEAL" },
                          { "code": "45", "name": "INTRALESIONAL" },
                          { "code": "46", "name": "INTRALUMINAL" },
                          { "code": "47", "name": "INTRALYMPHATIC" },
                          { "code": "48", "name": "INTRAMEDULLARY" },
                          { "code": "49", "name": "INTRAMENINGEAL" },
                          { "code": "50", "name": "INTRAMUSCULAR" },
                          { "code": "51", "name": "INTRAOCULAR" },
                          { "code": "52", "name": "INTRAOVARIAN" },
                          { "code": "53", "name": "INTRAPERICARDIAL" },
                          { "code": "54", "name": "INTRAPERITONEAL" },
                          { "code": "55", "name": "INTRAPLEURAL" },
                          { "code": "56", "name": "INTRAPROSTATIC" },
                          { "code": "57", "name": "INTRAPULMONARY" },
                          { "code": "58", "name": "INTRASINAL" },
                          { "code": "59", "name": "INTRASPINAL" },
                          { "code": "60", "name": "INTRASYNOVIAL" },
                          { "code": "61", "name": "INTRATENDINOUS" },
                          { "code": "62", "name": "INTRATESTICULAR" },
                          { "code": "63", "name": "INTRATHECAL" },
                          { "code": "64", "name": "INTRATHORACIC" },
                          { "code": "65", "name": "INTRATUBULAR" },
                          { "code": "66", "name": "INTRATUMOR" },
                          { "code": "67", "name": "INTRATYMPANIC" },
                          { "code": "68", "name": "INTRAUTERINE" },
                          { "code": "69", "name": "INTRAVASCULAR" },
                          { "code": "70", "name": "INTRAVENOUS" },
                          { "code": "71", "name": "INTRAVENOUS BOLUS" },
                          { "code": "72", "name": "INTRAVENOUS DRIP" },
                          { "code": "73", "name": "INTRAVENTRICULAR" },
                          { "code": "74", "name": "INTRAVESICAL" },
                          { "code": "75", "name": "INTRAVITREAL" },
                          { "code": "76", "name": "IONTOPHORESIS" },
                          { "code": "77", "name": "IRRIGATION" },
                          { "code": "78", "name": "LARYNGEAL" },
                          { "code": "79", "name": "NASAL" },
                          { "code": "80", "name": "NASOGASTRIC" },
                          { "code": "81", "name": "NOT APPLICABLE" },
                          { "code": "82", "name": "OCCLUSIVE DRESSING TECHNIQUE" },
                          { "code": "83", "name": "OPHTHALMIC" },
                          { "code": "84", "name": "ORAL" },
                          { "code": "85", "name": "OROPHARYNGEAL" },
                          { "code": "86", "name": "OTHER" },
                          { "code": "87", "name": "PARENTERAL" },
                          { "code": "88", "name": "PERCUTANEOUS" },
                          { "code": "89", "name": "PERIARTICULAR" },
                          { "code": "90", "name": "PERIDURAL" },
                          { "code": "91", "name": "PERINEURAL" },
                          { "code": "92", "name": "PERIODONTAL" },
                          { "code": "93", "name": "RECTAL" },
                          { "code": "94", "name": "RESPIRATORY (INHALATION)" },
                          { "code": "95", "name": "RETROBULBAR" },
                          { "code": "96", "name": "SOFT TISSUE" },
                          { "code": "97", "name": "SUBARACHNOID" },
                          { "code": "98", "name": "SUBCONJUNCTIVAL" },
                          { "code": "99", "name": "SUBCUTANEOUS" },
                          { "code": "100", "name": "SUBLINGUAL" },
                          { "code": "101", "name": "SUBMUCOSAL" },
                          { "code": "102", "name": "TOPICAL" },
                          { "code": "103", "name": "TRANSDERMAL" },
                          { "code": "104", "name": "TRANSMUCOSAL" },
                          { "code": "105", "name": "TRANSPLACENTAL" },
                          { "code": "106", "name": "TRANSTRACHEAL" },
                          { "code": "107", "name": "TRANSTYMPANIC" },
                          { "code": "999", "name": "UNASSIGNED" },
                          { "code": "108", "name": "UNASSIGNED" },
                          { "code": "109", "name": "UNKNOWN" },
                          { "code": "110", "name": "URETERAL" },
                          { "code": "111", "name": "URETHRAL" },
                          { "code": "112", "name": "VAGINAL" }
                        ]
                        search: true
                        optionsDisplayProperty: "name"                        
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
                      validation: {
                        operator: "REGEX"
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.thisResponse"]
                          }
                          { value: "^[0-9]+$" }
                        ]
                      }
                      validationMessage: "Response must be a number"
                    }
                    {
                      code: "S1PB4"
                      index: 180
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1TextPage4"
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
                      parameters: {
                        label: "Upload ingredients list"
                        description: "Only 1 file allowed.  \\nFile extension allowed: **pdf**, **doc**, **docx**, **xls**."
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
                        description: "Maximum of 5 image files allowed.  \\nFile extension allowed: **pdf**, **png**, **jpg**, **jpeg**."
                        fileExtensions: ["pdf", "png", "jpg", "jpeg"]
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
                        description: "Maximum of 5 image files allowed.  \\nFile extension allowed: **pdf**, **png**, **jpg**, **jpeg**."
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
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                id: 9
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
                # To-do: add more review levels for consolidation
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                id: 10
                number: 3
                title: "Final Decision"
                description: "This is the final step and will change the outcome of this applications."
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
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
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "applyGeneral" }
                }
              }
              # Review Drug Registration Stage 1
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canScreenDrugRego" }
                }
                restrictions: { canSelfAssign: true }
                levelNumber: 1
                stageNumber: 1
              }
              # Assign Drug Registration Stage 2
              {
                permissionNameToPermissionNameId: {
                  connectByName: { name: "canAssignDrugRego" }
                }
                levelNumber: 1
                stageNumber: 2
              }
              # Review Drug Registration Stage 2 -- uncomment when available
              # {
              #   permissionNameToPermissionNameId: {
              #     connectByName: { name: "canAssessDrugRego" }
              #   }
              #   levelNumber: 1
              #   stageNumber: 2
              # }
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
