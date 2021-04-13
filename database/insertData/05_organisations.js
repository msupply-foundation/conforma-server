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
              registration: "XYZ1234"
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
              registration: "ABC1982"
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
              registration: "XXX8798"
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
              registration: "QRS9999"
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
          userRole: "Owner"
          organisationToOrganisationId: { connectByName: { name: "Drugs-R-Us" } }
          userToUserId: { connectByUsername: { username: "nmadruga" } }
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
          organisationToOrganisationId: {
            connectByName: { name: "Medicinal Importers, Ltd." }
          }
          userToUserId: { connectByUsername: { username: "nmadruga" } }
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
          organisationToOrganisationId: {
            connectByName: { name: "Drug Dealers West" }
          }
          userToUserId: { connectByUsername: { username: "nmadruga" } }
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
          userRole: "Owner"
          organisationToOrganisationId: {
            connectByName: { name: "Medicinal Importers, Ltd." }
          }
          userToUserId: { connectByUsername: { username: "carl" } }
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
          organisationToOrganisationId: {
            connectByName: { name: "Drug Dealers West" }
          }
          userToUserId: { connectByUsername: { username: "carl" } }
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
          organisationToOrganisationId: {
            connectByName: { name: "Lab Facilities Inc." }
          }
          userToUserId: { connectByUsername: { username: "carl" } }
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
          userRole: "Owner"
          organisationToOrganisationId: {
            connectByName: { name: "Drug Dealers West" }
          }
          userToUserId: { connectByUsername: { username: "andrei" } }
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
          userRole: "Owner"
          organisationToOrganisationId: {
            connectByName: { name: "Drug Dealers West" }
          }
          userToUserId: { connectByUsername: { username: "js" } }
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
