/*
TEMPLATE E - Drug Resgistration (Generic Medicines Procedure - simple version)
  - a simple template with first page and upload documents to be used in demo
    for testing the main Drug registation application and review process
*/
const { coreActions } = require('./core_actions')
const { devActions } = require('./dev_actions')

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
                        title: "#### Page 1"
                        text: "Start application by providing the product **NAME** and **ORIGIN**"
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
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: ["responses.Q1.text"]
                          }
                          { value: "" }
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
                        description: "_Select the origin of the product._"
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
                        label: "Country code"
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
                        search: true
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
                        title: "**Country name**"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q3GraphQL.selection.name",
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
                        title: "#### Page 2"
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
                        label: "ATC Code"
                        options: {
                          operator: "graphQL",
                          children: [
                            "query GetAllProducts { entities( filter: {}, offset: 0, first: 1000) { data { code description type properties { type value } } } }",
                            "https://codes.msupply.foundation:2048/graphql",
                            [],
                            "entities.data"
                          ]
                        }
                        optionsDisplayProperty: "description"
                        placeholder: "Type name for ATC code"
                        search: true
                      }
                    }
                    {
                      code: "S1TextUC-code"
                      index: 60
                      title: "UC code"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "**mSupply UC - code**"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q4GraphQL.selection.code"
                            ""
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [ "responses.S1Q4GraphQL" ]
                          }
                          null
                        ]
                      }
                    }
                    {
                      code: "S1TextUC-Type"
                      index: 70
                      title: "UC Product type"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "**Product type**"
                        text: {
                          operator: "objectProperties"
                          children: [
                            "responses.S1Q4GraphQL.selection.type"
                            ""
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "!="
                        children: [
                          {
                            operator: "objectProperties"
                            children: [ "responses.S1Q4GraphQL" ]
                          }
                          null
                        ]
                      }
                    }
#                    {
#                      code: "S1TextUC-WHO"
#                      index: 75
#                      title: "WHO code"
#                      elementTypePluginCode: "textInfo"
#                      category: INFORMATION
#                      parameters: {
#                        title: "WHO - EML code"
#                        text: {
#                          operator: "objectProperties"
#                          children: [
#                            "responses.S1Q4GraphQL.selection.properties",
#                            ""
#                          ]
#                        }
#                      }
#                    }
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
                        title: "#### Page 3"
                        text: "In this section, we require information about **PRESCRIPTION**"
                      }
                    }
                    {
                      code: "S1Q6FormulationRadio"
                      index: 100
                      title: "Formulations"
                      elementTypePluginCode: "radioChoice"
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
                      code: "S1Q7PrescriptionOTC"
                      index: 110
                      title: "Prescriptions/OTC - code"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Prescriptions/OTC"
                        options: [
                          { code: "HCD", name: "Highly Controlled Medicine" },
                          { code: "LCD", name: "Limited Controlled Medicine" },
                          { code: "OTC", name: "Over The Counter Medicine" },
                          { code: "POM", name: "Prescription Only Medicine" }
                        ]
                        optionsDisplayProperty: "name"
                      }
                    }
                    {
                      code: "S1Q9Strength"
                      index: 120
                      title: "Strength"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: "Strength"
                      }
                    }
                    {
                      code: "S1Q10Route"
                      index: 130
                      title: "Route of administration"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Route of administration"
                        description: "To be replaced with Lookup table"
                        options: [
                          { code: "2", name: "BUCCAL" },
                          { code: "3", name: "CONJUNCTIVAL" },
                          { code: "4", name: "CUTANEOUS" },
                          { code: "5", name: "DENTAL" },
                          { code: "6", name: "ELECTRO-OSMOSIS" },
                          { code: "7", name: "ENDOCERVICAL" },
                          { code: "8", name: "ENDOSINUSIAL" },
                          { code: "9", name: "ENDOTRACHEAL" },
                          { code: "10", name: "ENTERAL" },
                          { code: "11", name: "EPIDURAL" },
                          { code: "12", name: "EXTRA?AMNIOTIC" },
                          { code: "13", name: "EXTRACORPOREAL" },
                          { code: "14", name: "HEMODIALYSIS" },
                          { code: "15", name: "INFILTRATION" },
                          { code: "16", name: "INTERSTITIAL" },
                          { code: "17", name: "INTRA-ABDOMINAL" },
                          { code: "18", name: "INTRA-AMNIOTIC" },
                          { code: "19", name: "INTRA-ARTERIAL" },
                          { code: "20", name: "INTRA-ARTICULAR" },
                          { code: "21", name: "INTRABILIARY" },
                          { code: "22", name: "INTRABRONCHIAL" },
                          { code: "23", name: "INTRABURSAL" },
                          { code: "24", name: "INTRACARDIAC" },
                          { code: "25", name: "INTRACARTILAGINOUS" },
                          { code: "26", name: "INTRACAUDAL" },
                          { code: "27", name: "INTRACAVERNOUS" },
                          { code: "28", name: "INTRACAVITARY" },
                          { code: "29", name: "INTRACEREBRAL" },
                          { code: "30", name: "INTRACISTERNAL" },
                          { code: "31", name: "INTRACORNEAL" },
                          { code: "32", name: "INTRACORONAL, DENTAL" },
                          { code: "33", name: "INTRACORONARY" },
                          { code: "34", name: "INTRACORPORUS CAVERNOSUM" },
                          { code: "35", name: "INTRADERMAL" },
                          { code: "36", name: "INTRADISCAL" },
                          { code: "37", name: "INTRADUCTAL" },
                          { code: "38", name: "INTRADUODENAL" },
                          { code: "39", name: "INTRADURAL" },
                          { code: "40", name: "INTRAEPIDERMAL" },
                          { code: "41", name: "INTRAESOPHAGEAL" },
                          { code: "42", name: "INTRAGASTRIC" },
                          { code: "43", name: "INTRAGINGIVAL" },
                          { code: "44", name: "INTRAILEAL" },
                          { code: "45", name: "INTRALESIONAL" },
                          { code: "46", name: "INTRALUMINAL" },
                          { code: "47", name: "INTRALYMPHATIC" },
                          { code: "48", name: "INTRAMEDULLARY" },
                          { code: "49", name: "INTRAMENINGEAL" },
                          { code: "50", name: "INTRAMUSCULAR" },
                          { code: "51", name: "INTRAOCULAR" },
                          { code: "52", name: "INTRAOVARIAN" },
                          { code: "53", name: "INTRAPERICARDIAL" },
                          { code: "54", name: "INTRAPERITONEAL" },
                          { code: "55", name: "INTRAPLEURAL" },
                          { code: "56", name: "INTRAPROSTATIC" },
                          { code: "57", name: "INTRAPULMONARY" },
                          { code: "58", name: "INTRASINAL" },
                          { code: "59", name: "INTRASPINAL" },
                          { code: "60", name: "INTRASYNOVIAL" },
                          { code: "61", name: "INTRATENDINOUS" },
                          { code: "62", name: "INTRATESTICULAR" },
                          { code: "63", name: "INTRATHECAL" },
                          { code: "64", name: "INTRATHORACIC" },
                          { code: "65", name: "INTRATUBULAR" },
                          { code: "66", name: "INTRATUMOR" },
                          { code: "67", name: "INTRATYMPANIC" },
                          { code: "68", name: "INTRAUTERINE" },
                          { code: "69", name: "INTRAVASCULAR" },
                          { code: "70", name: "INTRAVENOUS" },
                          { code: "71", name: "INTRAVENOUS BOLUS" },
                          { code: "72", name: "INTRAVENOUS DRIP" },
                          { code: "73", name: "INTRAVENTRICULAR" },
                          { code: "74", name: "INTRAVESICAL" },
                          { code: "75", name: "INTRAVITREAL" },
                          { code: "76", name: "IONTOPHORESIS" },
                          { code: "77", name: "IRRIGATION" },
                          { code: "78", name: "LARYNGEAL" },
                          { code: "79", name: "NASAL" },
                          { code: "80", name: "NASOGASTRIC" },
                          { code: "81", name: "NOT APPLICABLE" },
                          { code: "82", name: "OCCLUSIVE DRESSING TECHNIQUE" },
                          { code: "83", name: "OPHTHALMIC" },
                          { code: "84", name: "ORAL" },
                          { code: "85", name: "OROPHARYNGEAL" },
                          { code: "86", name: "OTHER" },
                          { code: "87", name: "PARENTERAL" },
                          { code: "88", name: "PERCUTANEOUS" },
                          { code: "89", name: "PERIARTICULAR" },
                          { code: "90", name: "PERIDURAL" },
                          { code: "91", name: "PERINEURAL" },
                          { code: "92", name: "PERIODONTAL" },
                          { code: "93", name: "RECTAL" },
                          { code: "94", name: "RESPIRATORY (INHALATION)" },
                          { code: "95", name: "RETROBULBAR" },
                          { code: "96", name: "SOFT TISSUE" },
                          { code: "97", name: "SUBARACHNOID" },
                          { code: "98", name: "SUBCONJUNCTIVAL" },
                          { code: "99", name: "SUBCUTANEOUS" },
                          { code: "100", name: "SUBLINGUAL" },
                          { code: "101", name: "SUBMUCOSAL" },
                          { code: "102", name: "TOPICAL" },
                          { code: "103", name: "TRANSDERMAL" },
                          { code: "104", name: "TRANSMUCOSAL" },
                          { code: "105", name: "TRANSPLACENTAL" },
                          { code: "106", name: "TRANSTRACHEAL" },
                          { code: "107", name: "TRANSTYMPANIC" },
                          { code: "108", name: "UNASSIGNED" },
                          { code: "109", name: "UNKNOWN" },
                          { code: "110", name: "URETERAL" },
                          { code: "111", name: "URETHRAL" },
                          { code: "112", name: "VAGINAL" }
                        ]
                        optionsDisplayProperty: "name"
                        placeholder: "Seach route of administration"                  
                        search: true
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
                      code: "S1TextPage4"
                      index: 150
                      title: "Container information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "#### Page 4"
                        text: "In this section, we require information about **CONTAINER**"
                      }
                    }
                    {
                      code: "S1Q11Container"
                      index: 160
                      title: "Primary container"
                      elementTypePluginCode: "dropdownChoice"
                      category: QUESTION
                      parameters: {
                        label: "Primary container"
                        description: "To be replaced with Lookup table"
                        options: [
                          { code: "888", name: "Ampoule" },
                          { code: "2", name: "Bag" },
                          { code: "3", name: "Barrel" },
                          { code: "4", name: "Blister" },
                          { code: "5", name: "Bottle" },
                          { code: "6", name: "Box" },
                          { code: "7", name: "Cartridge" },
                          { code: "8", name: "Container" },
                          { code: "NA", name: "Data not available" },
                          { code: "9", name: "Dose-dispenser cartridge" },
                          { code: "10", name: "Dredging container" },
                          { code: "11", name: "Dropper container" },
                          { code: "12", name: "Fixed cryogenic vessel" },
                          { code: "13", name: "Gas cylinder" },
                          { code: "14", name: "Jar" },
                          { code: "15", name: "Mobile cryogenic vessel" },
                          { code: "16", name: "Multidose container" },
                          { code: "17", name: "Multidose container with airless pump" },
                          { code: "18", name: "Multidose container with metering pump" },
                          { code: "19", name: "Multidose container with pump" },
                          { code: "MULTI", name: "MULTIPLE - SEE PACK AND INGREDIENT DESCRIPTION" },
                          { code: "20", name: "Pre-filled gastroenteral tube" },
                          { code: "21", name: "Pre-filled injector" },
                          { code: "22", name: "Pre-filled oral applicator" },
                          { code: "23", name: "Pre-filled oral syringe" },
                          { code: "24", name: "Pre-filled pen" },
                          { code: "25", name: "Pre-filled syringe" },
                          { code: "26", name: "Pressurised container" },
                          { code: "27", name: "Roll-on container" },
                          { code: "28", name: "Sachet" },
                          { code: "29", name: "Single-dose container" },
                          { code: "30", name: "Spray container" },
                          { code: "31", name: "Straw" },
                          { code: "32", name: "Strip" },
                          { code: "33", name: "Tablet container" },
                          { code: "34", name: "Tube" },
                          { code: "35", name: "Unit-dose blister" },
                          { code: "36", name: "Vial" }
                        ]
                        optionsDisplayProperty: "name"
                        placeholder: "Search primary container types"
                        search: true                     
                      }
                    }
                    {
                      code: "S1Q12NumberUnits"
                      index: 170
                      title: "Packaging and number of units"
                      elementTypePluginCode: "longText"
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
                      code: "S1TextPage5"
                      index: 190
                      title: "Dosage information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "#### Page 5"
                        text: "In this section, we require information about **DOSAGE**"
                      }
                    }
                    {
                      code: "S1Q13AdministrationUnit"
                      index: 200
                      title: "Administration unit"
                      elementTypePluginCode: "radioChoice"
                      category: QUESTION
                      parameters: {
                        label: "Administration unit"
                        options: [
                          { code: 1, name: "Same as dosage form (e.g. tablet, capsule)" },
                          { code: 2, name: "Same as primary container (e.g. ampoule, vial, sachet)" },
                          { code: 3, name: "Liquid or reconstituted preparation (e.g. oral solution, dry syrup, large volume injectable solution)" },
                          { code: 4, name: "Semisolid (e.g. cream)" }
                        ]
                        optionsDisplayProperty: "name"
                        hasOther: true  
                      }
                    }
                    {
                      code: "S1Q14NumberOfDoses"
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
                            children: ["responses.S1Q13AdministrationUnit.selection.code"]
                          }
                          { value: 1 }
                        ]
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
                      code: "S1Q14NumberOfContainers"
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
                            children: ["responses.S1Q13AdministrationUnit.selection.code"]
                          }
                          { value: 2 }
                        ]
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
                      code: "S1Q15NumberOfMilliliters"
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
                            children: ["responses.S1Q13AdministrationUnit.selection.code"]
                          }
                          { value: 2 }
                        ]
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
                      code: "S1Q14NumberReconstitution"
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
                            children: ["responses.S1Q13AdministrationUnit.selection.code"]
                          }
                          { value: 3 }
                        ]
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
                      code: "S1Q14NumberOfGrams"
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
                            children: ["responses.S1Q13AdministrationUnit.selection.code"]
                          }
                          { value: 4 }
                        ]
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
                      code: "S1Q14NumberOfOther"
                      index: 270
                      title: "Number of (other) per pack"
                      elementTypePluginCode: "shortText"
                      category: QUESTION
                      parameters: {
                        label: {
                          operator: "stringSubstitution"
                          children: [
                            "Number of (%1) per pack"
                            {
                              operator: "objectProperties"
                              children: ["responses.S1Q13AdministrationUnit.text"]
                            }
                          ]
                        }
                      }
                      visibilityCondition: {
                        operator: "AND"
                        children: [
                          {
                            operator: "="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.S1Q13AdministrationUnit.other"]
                              }
                              { value: true }
                            ]
                          }
                          {
                            operator: "!="
                            children: [
                              {
                                operator: "objectProperties"
                                children: ["responses.S1Q13AdministrationUnit.text"]
                              }
                              ""
                            ]
                          }
                        ]
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
                      code: "S1PB5"
                      index: 280
                      title: "Page Break"
                      elementTypePluginCode: "pageBreak"
                      category: INFORMATION
                    }
                    {
                      code: "S1TextPage6"
                      index: 290
                      title: "Optional information"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        title: "#### Page 6"
                        text: "Optional information"
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
                      code: "S1Q22"
                      index: 310
                      title: "Comments"
                      elementTypePluginCode: "longText"
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
                code: "S2"
                title: "Ingredients"
                index: 1
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S2TextPage1"
                      index: 0
                      title: "Product Intro"
                      elementTypePluginCode: "textInfo"
                      category: INFORMATION
                      parameters: {
                        text: "In this section, we require the INGREDIENTS for **Drug registered**"
                      }
                    }
                    {
                      code: "S2Q1UploadIngredients"
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
                code: "S3"
                title: "Product images"
                index: 2
                templateElementsUsingId: {
                  create: [
                    {
                      code: "S3Q1UploadSamples"
                      index: 0
                      title: "File upload: Samples"
                      elementTypePluginCode: "fileUpload"
                      category: QUESTION
                      isRequired: false
                      parameters: {
                        label: "Upload samples"
                        description: "Maximum of 5 image files allowed.  \\nFile extension allowed: **pdf**, **png**, **jpg**, **jpeg**."
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
                      code: "S3Q2UploadImages"
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
                number: 1
                title: "Screening"
                description: "This application will go through the Screening stage before it can be accessed."
                colour: "#24B5DF" #teal blue
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                number: 2
                title: "Assessment"
                description: "This phase is where your documents will be revised before the application can get the final approval."
                colour: "#E17E48" #orange
                # To-do: add more review levels for consolidation
                templateStageReviewLevelsUsingId: {
                  create: [{ number: 1, name: "Review" }]
                }
              }
              {
                number: 3
                title: "Final Decision"
                colour: "#1E14DB" #dark blue
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
              ${devActions}
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
