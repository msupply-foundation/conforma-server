/*
Insert ORGANISATIONS 
  - and associate users with them
*/
exports.queries = [
  `mutation {
        createOrganisation(
          input: {
            organisation: {
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
        userOrganisation: {
          userId: 1
          organisationId: 1
          userRole: "Owner"
        }
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
        userOrganisation: {
          #id: 2
          userId: 1
          organisationId: 2
        }
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
        userOrganisation: {
          userId: 1
          organisationId: 3
        }
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
        userOrganisation: {
          userId: 2
          organisationId: 2
          userRole: "Owner"
        }
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
        userOrganisation: {
          userId: 2
          organisationId: 3
        }
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
        userOrganisation: {
          userId: 2
          organisationId: 4
        }
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
        userOrganisation: {
          userId: 3
          organisationId: 3
          userRole: "Owner"
        }
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
        userOrganisation: {
          userId: 5
          organisationId: 3
          userRole: "Owner"
        }
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
