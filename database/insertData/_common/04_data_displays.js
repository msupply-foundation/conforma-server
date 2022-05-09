exports.queries = [
  `mutation userOutcomes {
    createDataDisplay(
      input: {
        dataDisplay: {
          code: "user"
          detailColumnName: "username"
          tableName: "user"
          pluralTableName: "users"
          title: "Users"
          dataDisplayDetailsUsingId: {
            create: [
              {
                columnName: "firstName"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "First Name" }
                title: "First Name"
              }
              {
                columnName: "lastName"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Last Name" }
                title: "Last Name"
              }
              {
                columnName: "username"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Username" }
                title: "Username"
              }
              {
                columnName: "email"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Email" }
                title: "email"
              }
              {
                columnName: "dateOfBirth"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Date of Birth" }
                title: "Date of Birth"
              }
              {
                columnName: "nationalId"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "National Id" }
                title: "National Id"
              }
              {
                columnName: "secondary"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Secondary Education Details" }
                title: "Secondary Education Details"
              }
              {
                columnName: "universityHistory"
                elementTypePluginCode: "listBuilder"
                isTextColumn: false
                parameters: {
                  label: "Tertiary Education Details"
                  displayType: "table"
                  inputFields: [
                    { code: "LB1", title: "Name of institution" }
                    { code: "LB2", title: "University year" }
                    { code: "LB3", title: "University title" }
                  ]
                }
                title: "Tertiary Education Details"
              }
            ]
          }
          dataDisplayTablesUsingId: {
            create: [
              { columnName: "username", title: "Username", isTextColumn: true }
              { columnName: "firstName", title: "First Name", isTextColumn: true }
              { columnName: "lastName", title: "First Name", isTextColumn: true }
              { columnName: "email", title: "Email", isTextColumn: true }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation organisationOutcomes {
    createDataDisplay(
      input: {
        dataDisplay: {
          code: "organisation"
          detailColumnName: "name"
          tableName: "organisation"
          pluralTableName: "organisations"
          title: "Organisations"
          dataDisplayDetailsUsingId: {
            create: [
              {
                columnName: "registration"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Registration Number" }
                title: "Registration Number"
              }
              {
                columnName: "address"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Address" }
                title:  "Address"
              }
              {
                columnName: "logoUrl"
                elementTypePluginCode: "imageDisplay"
                isTextColumn: true
                parameters: {
                  url: {
                    operator: "+"
                    children: [
                      {
                        operator: "objectProperties"
                        children: ["applicationData.config.serverREST"]
                      }
                      {
                        operator: "objectProperties"
                        children: ["responses.thisResponse"]
                      }
                    ]
                  }
                  size: "tiny"
                  alignment: "center"
                  altText: "Organisation logo"
                }
                title: "Logo"
              }
              {
                columnName: "professionalExperience"
                elementTypePluginCode: "fileUpload"
                isTextColumn: false
                parameters: {
                  label: "Owner professional experience"
                  displayType: "card"
                  displayFormat: {
                    title: "\${PEname}"
                    subtitle: "\${PEtype}  \\n\${PEorgTel} \${PEorgEmail}"
                    description: "**Role**: \${PErole}  \\n\${PEfrom} – \${PEto}"
                  }
                  inputFields: [
                    {
                      code: "PEtype"
                      title: "Type of role"
                    }
                    {
                      code: "PEname"
                      title: "Org name"
                    }
                    {
                      code: "PEorgTel"
                      title: "Org telephone"
                    }
                    {
                      code: "PEorgEmail"
                      title: "Org email"
                    }
                    {
                      code: "PErole"
                      title: "Role"
                    }
                    {
                      code: "PEfrom"
                      title: "From"
                    }
                    {
                      code: "PEto"
                      title: "To"
                    }
                  ]
                }
                title:  "Owner professional experience"
              }
            ]
          }
          dataDisplayTablesUsingId: {
            create: [
              { columnName: "name", title: "Organisation Name", isTextColumn: true }
              { columnName: "registration", title: "Registration Number", isTextColumn: true }
              { columnName: "address", title: "Address", isTextColumn: true }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
  `mutation licenseOutcomes {
    createDataDisplay(
      input: {
        dataDisplay: {
          code: "license"
          detailColumnName: "serial"
          tableName: "license"
          pluralTableName: "licenses"
          title: "Licenses"
          dataDisplayDetailsUsingId: {
            create: [
              {
                columnName: "productType"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Product type" }
                title: "Product type"
              }
              {
                columnName: "type"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "License type" }
                title: "License type"
              }
              {
                columnName: "expiryDate"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Expiry date" }
                title:  "Expiry date"
              }
              {
                columnName: "companyName"
                elementTypePluginCode: "shortText"
                isTextColumn: true
                parameters: { label: "Company name" }
                title:  "Company name"
              }
            ]
          }
          dataDisplayTablesUsingId: {
            create: [
              { columnName: "serial", title: "Serial", isTextColumn: true }
              { columnName: "productType", title: "Product type", isTextColumn: true }
              { columnName: "type", title: "License type", isTextColumn: true }
              { columnName: "expiryDate", title: "Expiry date", isTextColumn: true }
              { columnName: "companyName", title: "Company name", isTextColumn: true }
            ]
          }
        }
      }
    ) {
      clientMutationId
    }
  }
  `,
]
