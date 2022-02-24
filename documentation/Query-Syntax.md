# (Dynamic) Query/Expression Syntax

This module is in `src/modules/expression-evaluator`, structured as its own package for standalone development.

The current build of the module is published to Github packages so it can be easily imported into both front- and back-end projects. See [Installation](#installation) at the end of this page for instructions on how to make it work in your environment, or [Development](#development) for information on further development of the module, including a browser-based GUI expression builder.

Run `yarn test` to see it in action. (See [Testing section](#testing) for more info)

---

**The problem**: the highly configurable Template system in mSupply Application Manager requires many values to be stored as dynamic queries to either local state or the database, and perform basic operations (logic, concatenation, etc.) on them. We need a way to represent these potentially complex “expressions” in the database so they can be evaluated at runtime (both in the front and back-end), but without resorting to using `eval()` to evaluate javascript code directly.

**The solution**: We store these queries in a JSON **expression tree** which can be easily traversed recursively and evaluated when needed. This way, we can store very simple values (e.g. literal strings) in the same format as complex dynamic queries. The function `evaluateExpression()` evaluates these expressions.

Any value that could possibly be a dynamic query should be stored in this format. This would include:

**Form Questions**:

- Parameters (Option lists, Labels, Placeholder text, etc.)
- Visibility conditions
- Validation criteria

**Triggers**:

- Conditions

**Actions**:

- input parameters

For more complex lookups, we would hide the complexity from the user in the Template builder, and just present a set of pre-defined “queries” in the UI, which map to a pre-written query with perhaps a selectable parameter or two. (However, we should also provide a JSON editor as an alternative if an advanced user wishes to manually create more complex queries.)

## Contents

<!-- toc -->
<!-- generated with markdown-toc -->

- [(Dynamic) Query/Expression Syntax](#dynamic-queryexpression-syntax)
  - [Contents](#contents)
- [Structure](#structure)
  - [type](#type)
  - [fallback](#fallback)
- [Operators](#operators)
  - [AND](#and)
  - [OR](#or)
  - [= (Equals)](#-equals)
  - [!= (Not equal)](#-not-equal)
  - [+ (Plus)](#-plus)
  - [? (Conditional)](#-conditional)
  - [REGEX](#regex)
  - [objectProperties](#objectproperties)
  - [stringSubstitution](#stringsubstitution)
  - [pgSQL](#pgsql)
  - [graphQL](#graphql)
  - [GET](#get)
  - [POST](#post)
    - [Authentication](#authentication)
  - [buildObject](#buildobject)
- [Usage](#usage)
    - [`expression`](#expression)
    - [`parameters`](#parameters)
- [Examples](#examples)
- [Installation](#installation)
- [Testing](#testing)
- [Development](#development)
    - [Publishing a new version of the package](#publishing-a-new-version-of-the-package)
    - [GUI expression builder](#gui-expression-builder)

<!-- tocstop -->

# Structure

Each node in the tree is an either:

- a simple type value (e.g. `string`, `number`, `boolean`, `array`) (the leaf nodes)
- an **operator** node, which is an object with the following properties:

```
{
  type: <optional>
  operator: <string>
  children: [ <optional> ]
  fallback: <optional>
}
```

`children` is an array of similar nodes, which are, in turn, either values or operator nodes themselves. The values returned from these child nodes provide the values on which the "operator" acts For example:

```
{
  operator: "+"
  children: [ 5, 3 ]
}
```

This expression would return the number **8** when evaluated. If `children` are themselves operator nodes, then they will be evaluated first (and recursively down through their child nodes) before its result is evaluated by the parent operator. The number of child nodes required and type of values returned by them depends on the requirements of the parent operator (see below for details).

## type

The `type` property is optional in most cases, but some operators will return their results in a different format depending on the `type` (e.g. pgSQL -- see below). For *all* operators, the evaluator will also attempt to convert it to to the specified `type`. This can be useful, for example, when a number is required from a string output. Note: type conversion follows Javascript type conversion rules using `Number(), String(), Boolean()`.

Valid values:

- string
- number
- boolean / bool
- array

## fallback

This property allows you to define a `fallback` value for *any* error that is thrown as a result of the query, or any of its children. This can be useful, for example, when making a database query with a parameter, and the parameter isn't available yet because it needs to come from a user's response. Rather than throw an error, or return a error message in the UI, we can provide a fallback (such as an empty string or empty array) so the malformed query is invisible to the end user (and also won't crash the plugin!)

The fallback value can be placed at any level of the query, and will be returned on any error of that node or any of its children. So, for example, if you were building an array of elements, of which only *some* were provided by a database query that might fail, then you could still return the rest of the results by placing a fallback value of an empty array at the level of the database query node.

Note that some of the operators have their own "fallback" node, which can also be used. This is mainly for backwards compatibility purposes -- this top-level `fallback` parameter is the recommended way to handle errors with fallbacks.

Because the fallback doesn't give any useful information about errors, it is recommended that you don't add a fallback value while building and/or debugging queries, so you can benefit from more useful error reporting. The fallback value should be added at the end once you're happy with it.


# Operators

## AND

Implements logical AND on the returned values of its child nodes.

- Input: 1 or more nodes that return a **boolean** value
- Output: **boolean**

## OR

Implements logical OR on the returned values of its child nodes.

- Input: 1 or more nodes that return a **boolean** value
- Output: **boolean**

## = (Equals)

Equality test for child nodes

- Input: 1 or more nodes of either **string** or **number** type.
- Output: **boolean**

_Note: uses javascript "loose" equality, so `2 == "2"` and `null == undefined`._

## != (Not equal)

Inequality test for child nodes

- Input: Exactly 2 nodes of either **string** or **number** type.
- Output: **boolean**

## + (Plus)

Can also use: `CONCAT`

Either adds, concatenates or merges child nodes, depending on data type and the "type" property.

- Input: 1 or more nodes of any type
- Output: depends on the following rules (in order of priority):
  - if `type: "array"` is specfied, nodes will be concatenated into a single array e.g. `[1, 2, 3] + "four" => [1, 2, 3, "four"]`
  - if `type: "string"` is specified, nodes will be concatenated into a single string e.g. `[1, 2, 3] + "four" => "1,2,3four"`
  - if ALL children are either arrays or strings, they will be concatenated into whichever type is the first node
  - if ALL children are Objects, they will be merged into a single object will all properties e.g. `{ one: 1, two: 2 } + { three: 3 } => { one: 1, two: 2, three: 3 }`
  - in all other cases, the children will be combined using the standard javascript `+` operator, which is either "add" or "concatenate" depending on type (e.g. `2 + 2 => 4` ; `"2" + "two" => "2two"`)

## ? (Conditional)

Returns a different value depending on whether an expression is `true` or `false`.

- Input:

  - 1st child node returns `true` or `false`
  - 2nd node returns value if `true`
  - 3rd node returns value if `false`

- Output: the result of either child 1 or child 2

Functionally equivalent to javascript ternary (`?`) operator

## REGEX

Compares an input string with a regular expression string and returns whether it matches.

- Input: Exactly 2 nodes of **string** type. First must contain string to be evaluated, second contains the regex.
- Output: **boolean**

## objectProperties

For extracting values from local state objects (e.g. `user`, `organisation` or `form`) as part of dynamic queries, e.g to determine a question's visibility condition based on an answer to a previous question.

The `evaluateExpression` function expects each expression to be passed along with _all_ objects that are required for evaluation in any descendant nodes. See **Usage** below for detailed overview of arguments.

- Input:

  - 1st child node returns the name of the field whose value is to be extracted. Can be a nested property, written in dot notation (e.g. `questions.q2`)
  - 2nd (optional) node returns a Fallback value, to be returned if the property specified in the first node can't be resolved. Default is string "Can't resolve object", but could be useful to set to `null` in some cases.

- Output: the value specified in `property` of any type.

**Example**:

```
evaluateExpression(
    {
      operator: 'objectProperties',
      children: [ 'application.responses.q1' ]
    },
    { objects: { application } } )
```

where `application` is the local state object:

```
application = {
  id: 1,
  name: 'Drug Registration',
  status: 'DRAFT',
  stage: 1,
  responses: { q1: 'What is the answer?', q2: 'Enter your name' },
}
```

**Note**: arrays can be accessed in multiple ways, depending on your requirements. Most simply, arrays can be accessed by index, e.g. `responses.user.selection[1]`. However, if there is an array of objects, it's possible to return a single property from within each object as an array. For example, if you have data object:
```
{ orgs: [{id: 1, name: "Org 1"}, {id: 2, name: "Org 2"}]}
```
The following property strings will return these results:
```
"orgs" -> [{id: 1, name: "Org 1"}, {id: 2, name: "Org 2"}]
"orgs.name" -> [ "Org 1", "Org 2" ]
"orgs[0]" -> {id: 1, name: "Org 1"}
"orgs[1].id" -> 2

```

## stringSubstitution

Replaces placeholder parameters (`%1`, `%2`, etc) in strings with values supplied during evaluation.

- Input:

  - 1st child node returns a **string** containing a parameterized query (e.g.`"Hello %1, welcome to our application!"` )
  - 2nd...N nodes provide the replacement **strings** for the parameters in the first string.

  **Example**:

```
  {
    operator: "stringSubstitution",
    children: [
      "Dear %1, congratulations on your approval for registration of your product: %2",
      "John",
      "Paracetamol"
    ]
  }
```

Obviously the substitutions are likely to be dynamically generated values from `objectProperties` or `API`/`Database` queries.

## pgSQL

Performs queries to a connected PostGres database and returns the result in a format specified by `type`.

- Input:
  - 1st child node returns a **string** containing the parameterized SQL query (i.e. `$1`, `$2` substitution)
  - 2nd...N nodes return the values (**strings**, **numbers**, **arrays**) required for the above query substitution.
- Output: Depending on the `type` field:
  - `type: 'array'`: returns all values flattened into one array
  - `type: 'string'`: returns all results concatenated with spaces
  - `type: 'number'`: returns a single number
  - no `type` specified: returns the default `node-postgres` format (an array of objects, with fields of each object being the database column names)

**Example**:

```
{ type: 'string',
  operator: 'pgSQL',
  children: [
    'SELECT name FROM application WHERE template_id = $1',
    2,
  ]
}
```

## graphQL

Performs queries on connected GraphQL interface.

- Input:
  - 1st child node returns a **string** representing the GraphQL query
  - 2nd child node returns a **string** containing the url of the GrapqhQL endpoint. Using the value "graphQLEndpoint" (or empty string `""`) will the use the graphQL endpoint specified in the input parameter "GraphQLConnection" object.
  - 3nd child node returns an **array** of field names for the query's associated variables object. If no variables are required for the query, pass an empty array (i.e. `{ value: [] }`).
  - 4rd...N-1 child nodes return the values of the fields for the variables object -- one node for each field in the previous node's array.
  - The Nth (last) child node returns a **string** stating the node in the returned GraphQL object that is required. E.g. `applications.name` Because GraphQL returns results as nested objects, to get an output in a "simple type", a node in the return object tree is needed. (See examples below and in `TestData`). This last node is optional -- if not provided, the whole result object will be returned unmodified. This extraction follows the same rules as "[objectProperties](#objectproperties) operator above.
- Output: the returned GraphQL node can be either `string`, `number`, `boolean`, `array`, or `object`. If the output is an object, it will be returned as follows:

  - If there is only one field, only the value of the field will be returned.
  - If there is more than one field, the whole object will be returned.
  - Objects contained within arrays are also returned with the above logic.

**Example**:

```
{ operator: 'graphQL',
  children: [
    `query App($appId:Int!) {
        application(id: $appId) {
          name
        }
    }`,
    "graphQLEndpoint",
    ['appId'],
    1,
    'application.name',
  ] }
```

**Note**: To use the GraphQL straight away from what is in the graphil (json like), use it wrapped with \`backticks\`, otherwise it needs to be all in the same line.

## GET

Performs http GET requests to API endpoints, with optional authentication (see [below](#authentication)).

- Input: _(note: basically the same as GraphQL)_
  - 1st child node returns a **string** containing the url of the API endpoint
  - 2nd child node returns an **array** of field names for the url query parameters. If no query parameters are required, pass an empty array (i.e. `{ value: [] }`).
  - 3rd...N-1 child notes return the values for the query parameters in the 2nd node -- one node for each field name
  - Nth (last) child node returns a **string** stating the field/property of the return JSON object that is required. This is optional -- if not supplied the complete response data is returned (which is what you'd want if expecting something other than JSON object).
- Output: returned value can be any type. If is is an object, will be simplified according to the same rules as the **GraphQL** operator (above)  
  Note: if an array of objects is returned, the selected field (specified in the last input node) will apply to each object in the array.

**Example**:

This expression queries our `/check-unique` endpoint to test if the username "druglord" is availabe. The full url would be:  
`http://localhost:8080/check-unique?type=username&value=druglord`

```
{
  operator: 'GET',
  children: [
    'http://localhost:8080/check-unique',
    ['type', 'value'],
    'username'
    'druglord',
  ],
}
```

## POST

Performs http POST requests to public API endpoints.

The input/output specifications are the same as for the GET operator, except the key-value pairs of properties will also be passed as an object in the body of the request.

**Example**:

This expression queries our `/login` endpoint to check a user's credentials, and returns a boolean value indicating success/failure:

```
{
  operator: 'POST',
  children: [
    'http://localhost:8080/login',
    ['username', 'password'],
    'js'
    '123456',
    'success'
  ],
}
```

### Authentication

The `GET`, `POST`, and `GraphQL` operators may require authentication for the endpoints they are querying, such as our own [API](API). This can be achieved in a couple of different ways.

1. Pass the authentication information as part of the [parameters](#parameters) `headers` field. For example, a JWT authentication might be:  
    ```
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGFydGhfdmFkZXIifQ.UT8qpoNVJGam4HEasxQdJ7tiYC2UzvIGcu_9OUMLJ1k"
    }
    ```  
    In the front-end app, all evaluator queries use this mechanism to pass the current user's JWT, and this should be sufficient for most purposes. It's only if you require sending different headers, or need to dynamically build an authentication token, or have queries to external authenticated APIs, that you might need this second option:

2. HTTP headers can be baked into each query by over-riding the "url" node of API/GraphQL queries. As described above, the "url" node normally expects a string url. However, you can also provided this node as an object with the following structure:  
    ```
    {
      url: "<url-string-as-above>",
      headers: <headers-object-as-above>
    }
    ```
    In this case, the evaluator will parse the url and headers from this node and continue as normal, but the `headers` object will take priority over any that may be included in `parameters`. The `headers` object can be dynamically created using the [`buildObject`](#buildobject) operator if required. See the test suite query `testData.APIisUniqueWithHeader` for an example of how to do this.


## buildObject

Build a key/value object with evaluatable keys and values

Using custom object shape for configuration vs children array

- Input format

```
properties: [{
  key: {evaluation or value}
  value: {evaluation or value}
},
  ... { more key-values }
]
```

- Output evaluated object, empty object by default. If value or key evaluates to `undefined`, the property will be omitted from the output.

**See test in {evaluator module}/src/resolvers/buildObject.test.ts for further examples**

**Example**:

Input

```
{
  operator: "buildObject",
  properties: [{
    key: "someKey",
    value: true
  }]
}
```

Output

```
{
  "someKey": true
}
```

Input

```
{
  operator: "buildObject",
  properties: [
    {
      key: "someKey",
      value: "someValue"
    },
    {
      key: {
        operator: "+",
        children: ["evaluated", "key"]
      },
      value: {
        operator: "AND",
        children: [true, false]
       },
     }
  ]
}
```

Output

```
{
  "someKey": "someValue",
  "evaluatedKey": false
}
```

# Usage

The query evaluator is implemented in the `evaluateExpression` function:

`evaluateExpression(expression: Object, parameters: Object)`

### `expression`

`expression` must contain at least one node with a `value` property, or an operator with associated child nodes, otherwise the function returns `undefined`.

### `parameters`

`parameters` is an (optional) object with the following (optional) properties available:

- `objects : {local objects}` -- **object** containing nested local state objects required for the query (see **objectProperties** above)
- `pgConnection: <postGresConnect object>` (or any valid PostGres connection object, e.g. `Client` from `node-postgres`)
- `graphQLConnection: { fetch: <fetch object>, endpoint: <URL of GraphQL endpoint>}` -- connection information for a local GraphQL endpoint. Only required if expression contains **graphQL** operator.
- `APIfetch: <fetch object>` -- required if the API operator is being used. (Note: the reason this must be passed in rather than having the module use `fetch` directly is so it can work in both front- and back-end. The browser provides a native `fetch` method, but this isn't available in Node, which requires the `node-fetch` package. So in order to work in both, the module expects the appropriate variant of the fetch object to be passed in.)
- `headers: <HTTP request headers object>` -- optional headers for API or GraphQL requests, such as Authentication tokens. See [Authentication](#authentication) for more information.

# Examples

There is a **jest** test suite contained with this module’s repo which demonstrates a range of test cases. Here are a few:

**Example 1**: Concatenation of user’s first and last names

Note: `user` object is passed to `evaluateExpression` function in the 2nd parameter, \
i.e `{user: "user"}`

Tree structure:

[[images/query-syntax-example-1.png|Example 1 tree diagram]]

```
{
 type: "string",
 operator: "CONCAT",
 children: [
   {
     operator: "objectProperties",
     children: [ "user.firstName" ],
   },
   " ",
   {
     operator: "objectProperties",
     children: [ "user.lastName" ],
   },
 ],
}
```

**Example 2**: Visibility condition: Answer to Q1 (whose `code` is "q1") is "Drug Registration" and user belongs to at least one organisation.

_Note: this query uses PostGres (pgSQL) operator -- in the app, we’ll probably use GraphQL for front-end queries (visibility condition, form elements) and pgSQL for server-side queries (Action conditions)_

Tree structure:

[[images/query-syntax-example-2.png|Example 2 tree diagram]]

```
{
 operator: "AND",
 children: [
   {
     operator: "=",
     children: [
       {
         operator: "objectProperties",
         children: [ "form.q1" ],
       },
       "Drug Registration",
     ],
   },
   {
     operator: "!=",
     children: [
       {
         type: "number",
         operator: "pgSQL",
         children: [
           "SELECT COUNT(*) FROM user_organisation WHERE user_id = $1",
           {
             operator: "objectProperties",
             children: [ "user.id" ],
           },
         ],
       },
       0,
     ],
   },
 ],
}
```

**Example 3**: Validation: Organisation name is unique (i.e. The total count of Organisations with "name" equal to the value of the question response is zero)

Tree structure:

[[images/query-syntax-example-3b.png|Example 3 tree diagram]]

```
{
  operator: '=',
  children: [
    {
      operator: 'graphQL',
      children: [
        `query Orgs($orgName: String) {
            organisations(condition: {name: $orgName}) {
              totalCount
              nodes {
                name
                id
              }
            }
          }`,
        ['orgName'],
        {
          operator: 'objectProperties',
          children: [ "form2.q2" ],
        },
        "organisations.totalCount"
      ],
    },
    0,
  ],
}
```

<!--

**Example 3**: Trigger condition: Stage = SCREENING and All questions are Approved

Tree structure:

[[images/query-syntax-example-3.png|Example 3 tree diagram]]

```
{
 operator: "AND",
 children: [
   {
     operator: "=",
     children: [
       {
         operator: "objectProperties",
         children: [{ value: { object: "application", property: "stage" } }],
       },
       {
         value: 1,
       },
     ],
   },
   {
     operator: "=",
     children: [
       {
         operator: "graphQL",
         children: [
           { value: "Graph QL to return COUNT of questions for current application that are NOT Approved" },
           { value: { object: "application", property: "id" } },
         ],
       },
       {
         value: 0,
       },
     ],
   },
 ],
};
```

-->

<a name="installation"></a>

# Installation

The module is published as a Github package [here](https://github.com/openmsupply/application-manager-server/packages/433685).

In order to import packages from Github (rather than the default npm), the Github registry info needs to be added to an `.npmrc` config file in the project root, like so:

```
registry=https://registry.npmjs.org
@openmsupply:registry=https://npm.pkg.github.com
```

This is telling npm/yarn to use the normal npm registry, except for packages scoped with `@openmsupply` which should use Github. This file is probably already present in the project.

You'll also need to authenticate once with Github npm registry in order to download the package.

- First of all, create a **personal access token** on Github using [these instructions](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/creating-a-personal-access-token). When selecting scopes or permissions, make sure at least `read:packages` is selected
- Run `npm login --registry=https://npm.pkg.github.com` in the project root, and you'll be asked to supply your (Github) USERNAME, (personal access) TOKEN, and (public) EMAIL.

Then you can add the package to your project, if it's not already specified in `package.json`:

`yarn add @openmsupply/expression-evaluator`

It'll work exactly like a regular npm package after that.

To update to the latest release of the package, run:

`yarn upgrade @openmsupply/expression-evaluator`

<a name="development"></a>

# Testing

There is a [Jest](https://jestjs.io/) test suite for the expression evaluator included in the server repo. It can be run using:

```
 yarn test ./src/modules/expression-evaluator/src/evaluateExpression.test.ts 
```

(Or just `yarn test ./src/evaluateExpression.test.ts` from within evaluator subfolder )

However, for the tests to work you'll need two things:

1. Load the [snapshot](Snapshots) called `evaluator_test` from the private templates repo (in `/dev/snapshots`)
2. You'll need to provide authentication JWTs for certain tests. The test suite is expecting a file called `testSecrets.json` in the evaluator /src folder, with the following info:  
```
{
  "nonRegisteredAuth": "Bearer <nonRegistered-JWT-token>",
  "adminAuth": "Bearer <admin-JWT-token>"
}

```  
This secrets file is *not* included in any repo for security reasons, but can be found in Bitwarden "Sussol - IRIMS" folder.

# Development

The source code is located in `src/modules/expression-evaluator` for ongoing development. It's part of this main back-end repo, but has it's own `package.json` and `node_modules` so it can be developed and published independently. This means that in order to work on it you'll need to run `yarn install` from within this folder.

### Publishing a new version of the package

From within the expression-evaluator module's folder:

- Ensure that the module passes all tests:  
  `yarn test`
- Build the package:  
  `yarn build` (outputs to `/lib` folder)
- Publish to Github packages:  
  (will prompt you for a new version number -- please follow [semantic versioning](https://www.geeksforgeeks.org/introduction-semantic-versioning/))  
  `yarn publish`

Then you can bump the minimum version of the package in the dependent projects (front- and back-end in this case, or upgrade as above.)

### GUI expression builder

This is a browser-based dev tool within the expression-evaluator folder (`/expression-evaluate-gui`) to make building complex queries for templates easy to test and debug.

[[images/query-syntax-gui_screenshot.png|GUI screenshot]]

As it's a stand-alone project, before using it you'll need to run `yarn install` from within
the **expression-evaluate-gui** folder

You'll also need to add a .env file to the expression-evaluate-gui folder with the following content:

> SKIP_PREFLIGHT_CHECK=true

This prevents errors being thrown due to different projects having different versions of various dependencies.

Settings for database configurations, endpoints and ports are editable in `/src/config.json`

The app can be launched from either this app's folder or the root back-end folder:  
`yarn gui`

Additional notes:

- You have the option (Selector under Output header) of using the Development version or the Published (package) version of the expression-evaluator. Useful when making modifications and want to see how your changes have effected query output.
- `create-react-app` won't allow importing local modules outside the `src` folder. The workaround is to just re-copy the relevant files into this app's src folder on launch. This means that any changes made to the original `evaluateExpression.ts` won't show up with a hot reload -- you'll have to stop and start the app. If making changes to the module, I'd recommend working on the version in the GUI project folder, then manually copying this back to the module folder when ready to commit.
- the `node-postgres` package won't run directly from the browser, so there's a little Express server that also runs with this app that simply relays postgres queries from this app to postgres
- API calls to local server (e.g. `http://localhost:8080/check-unique)` don't work. I don't fully understand why, but I got round it by specifying a proxy to `http://localhost:8080` in `package.json` -- you just have to put relative links as the URL. i.e. `/check-unique`
