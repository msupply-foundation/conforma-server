exports.graphQLQueries = [
  //   Add some users
  `mutation {
    createUser(
      input: {
        user: { email: "nicole@sussol.net", passwordHash: "123456", username: "nmadruga",
        firstName: "Nicole" }
      }
    ) {
      user {
        email
        passwordHash
        username
      }
    }
  }`,
  `mutation {
createUser(
  input: {
    user: { email: "carl@sussol.net", passwordHash: "123456", username: "carl",
    firstName: "Carl", lastName: "Smith"
    dateOfBirth: "1976-12-23" }
  }
) {
  clientMutationId
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "andrei@sussol.net", passwordHash: "123456", username: "andrei",
    firstName: "Andrei" }
  }
) {
  clientMutationId
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "valerio@nra.org", passwordHash: "123456", username: "valerio",
    firstName: "Valerio" }
  }
) {
  user {
    email
    passwordHash
    username
  }
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "js@nowhere.com", passwordHash: "123456", username: "js",
    firstName: "John", lastName: "Smith"
   }
  }
) {
  clientMutationId
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "reviewer1@sussol.net", passwordHash: "123456", username: "testReviewer1",
    firstName: "Mr", lastName: "Reviewer 1" }
  }
) {
  clientMutationId
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "reviewer2@sussol.net", passwordHash: "123456", username: "testReviewer2",
    firstName: "Mrs", lastName: "Reviewer 2" }
  }
) {
  clientMutationId
}
}`,
  `mutation {
createUser(
  input: {
    user: { email: "assigner@sussol.net", passwordHash: "123456", username: "testAssigner",
    firstName: "Ms", lastName: "Assigner" }
  }
) {
  clientMutationId
}
}`,
]
