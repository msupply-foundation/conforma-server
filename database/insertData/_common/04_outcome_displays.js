exports.queries = [
  `mutation userOutcomes {
    createOutcomeDisplay(
      input: {
        outcomeDisplay: {
          code: "user"
          detailColumnName: "username"
          tableName: "user"
          pluralTableName: "users"
          title: "Users"
          outcomeDisplayDetailsUsingId: {
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
                title:  "Last Name"
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
            ]
          }
          outcomeDisplayTablesUsingId: {
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
    createOutcomeDisplay(
      input: {
        outcomeDisplay: {
          code: "organisation"
          detailColumnName: "name"
          tableName: "organisation"
          pluralTableName: "organisations"
          title: "Organisations"
          outcomeDisplayDetailsUsingId: {
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
                columnName: "registrationDocumentation"
                elementTypePluginCode: "fileUpload"
                isTextColumn: false
                parameters: { label: "Registration Documentation" }
                title: "Registration Documentation"
              }
            ]
          }
          outcomeDisplayTablesUsingId: {
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
    createOutcomeDisplay(
      input: {
        outcomeDisplay: {
          code: "license"
          detailColumnName: "serial"
          tableName: "license"
          pluralTableName: "licenses"
          title: "Licenses"
          outcomeDisplayDetailsUsingId: {
            create: [
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
          outcomeDisplayTablesUsingId: {
            create: [
              { columnName: "serial", title: "Serial", isTextColumn: true }
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
