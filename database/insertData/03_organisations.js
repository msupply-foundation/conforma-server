/*
Insert ORGANISATIONS 
  - and associate users with them
*/
exports.queries = [
  `mutation {
        createOrganisation(
          input: {
            organisation: {
              id: 1
              address: "123 Nowhere St\\nAuckland"
              licenceNumber: "XYZ1234"
              name: "Drugs-R-Us"
            }
          }
        ) {
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createOrganisation(
          input: {
            organisation: {
              id: 2
              address: "Queen St\\nAuckland"
              licenceNumber: "ABC1982"
              name: "Medicinal Importers, Ltd."
            }
          }
        ) {
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createOrganisation(
          input: {
            organisation: {
              id: 3
              address: "West Auckland"
              licenceNumber: "XXX8798"
              name: "Drug Dealers West"
            }
          }
        ) {
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createOrganisation(
          input: {
            organisation: {
              id: 4
              address: "1 Downtown Drive\\nAuckland"
              licenceNumber: "QRS9999"
              name: "Lab Facilities Inc."
            }
          }
        ) {
          organisation {
            name
          }
        }
      }`,
  // Associate users with organisations
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: { id: 1, userId: 1, organisationId: 1, userRole: "Owner" }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: { id: 2, userId: 1, organisationId: 2 }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: { id: 3, userId: 1, organisationId: 3 }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: { id: 4, userId: 2, organisationId: 2, userRole: "Owner" }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: {id: 5, userId: 2, organisationId: 3 }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: {id: 6, userId: 2, organisationId: 4 }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
  `mutation {
        createUserOrganisation(
          input: {
            userOrganisation: {id: 7, userId: 3, organisationId: 3, userRole: "Owner" }
          }
        ) {
          user {
            username
          }
          organisation {
            name
          }
        }
      }`,
]
