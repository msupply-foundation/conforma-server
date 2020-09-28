# (Dynamic) Query/Expression Syntax

_Note: The module is currently in the `src/modules` folder, but will be extracted to an npm package soon, to make it available to the front end as well._

_Run `yarn test` to see it in action -- the tests are in the `src/modules/evaluateExpression` folder._

**The problem**: the highly configurable Template system in mSupply Application Manager requires many values to be stored as dynamic queries to either local state or the database, and perform basic operations (logic, concatenation, etc.) on them. We need a way to represent these potentially complex “expressions” in the database so they can be evaluated at runtime (both in the front and back-end), but without resorting to using `eval()` to evaluate javascript code directly.

**The solution**: We store these queries in a JSON **expression tree** which can be easily traversed recursively and evaluated when needed. This way, we can store very simple values (e.g. literal strings) in the same format as complex dynamic queries. The function `evaluateExpression()` evaluates these expressions.

Any value that could possibly be a dynamic query should be stored in this format. This would include:

**Question**:

- Parameters (Option lists, Labels, Placeholder text, etc.)
- Visibility conditions
- Validation criteria

**Trigger**:

- Conditions

For more complex lookups, we would hide the complexity from the user in the Template builder, and just present a set of pre-defined “queries” in the UI, which map to a pre-written query with perhaps a selectable parameter or two. (However, we should also provide a JSON editor as an alternative if an advanced user wishes to manually create more complex queries.)

# Structure

Each node in the tree is an object with the following properties:

```
{
  value: <optional>
  type: <optional>
  operator: <optional>
  children: [ <optional> ]
}
```

At a minimum, a single `value` must be provided:

```
{ value: "Enter your first name" }
```

If a dynamic result is required, an `operator` is provided instead of a `value`, which is a pre-defined function that returns a value. If an `operator` is used, then also required is a `children` array, which contains child nodes, each with the same structure, which return the parameters for the `operator` to act on. For example:

```
{
  operator: "+"
  children: [ {value: 5}, {value: 3} ]
}
```

This expression would return the number **8** when evaluated.

Note that any child node can, in turn, be an operator node with its own children, allowing for expressions of arbitrary complexity. (See examples below)

## type

The `type` property is optional in most cases, but some operators will return their results in a different format depending on the `type` (e.g. pgSQL -- see below).

Valid values:

- string
- number
- boolean
- array
- object (maybe? -- not required yet)

# Operators

## AND

Implements logical AND on the returned values of its child nodes.

- Input: 1 or more nodes that return a **boolean** value
- Output: **boolean**

## OR

Implements logical OR on the returned values of its child nodes.

- Input: 1 or more nodes that return a **boolean** value
- Output: **boolean**

## CONCAT

Concatenates the values of the child nodes, which can be either strings or arrays.

- Input: 1 or more **string** or **array** nodes (must all be the same)
- Output: Either **string** or **array**, depending on the `type` specified (defaults to “**string**” if unspecified)

## = (Equals)

Equality test for child nodes

- Input: 1 or more nodes of either **string** or **number** type.
- Output: **boolean**

## != (Not equal)

Inequality test for child nodes

- Input: Exactly 2 nodes of either **string** or **number** type.
- Output: **boolean**

## + (Plus)

Adds any number of number nodes together

- Input: 1 or more nodes of **number** type.
- Output: **number**

## REGEX

Compares an input string with a regular expression string and returns whether it matches.

- Input: Exactly 2 nodes of **string** type. First must contain string to be evaluated, second contains the regex.
- Output: **boolean**

## objectProperties

Used to extract values from current state, for example, from `user`, `organisation` or `form` (i.e. previously entered responses) data. Any object to be evaluated must be passed in to the `evaluateExpression` function in its parameters object, with the field name identical to the object name (see below).

- Input: Exactly 1 node whose value contains an object with the following:  
  `value: {object: <name of object>, property: <object property>}`
- Output: whatever the property format is

## pgSQL

Performs queries to a connected PostGres database and returns the result in a format specified by `type`.

- Input:
  - First child node contains a **string** representing the parameterized SQL query (i.e. `$1`, `$2` substitution)
  - Remaining nodes return the values (**strings**, **numbers**, **arrays**) required for the above query substitution.
- Output: Either **array** (all values flattened into one array), **string** (all results concatenated with spaces), or a single **number**, depending on the type specification. If not specified, it returns the default `node-postgres` format (an array of objects, with fields of each object being the database column names).

## graphQL

Performs queries on connected GraphQL interface.

- Input:
  - First child node's value is a string representing the GraphQL query
  - Second child node's value is an array of field names for the query's associated variables object. If no variables are required for the query, pass an empty array.
  - Next node's values are the values of the fields for the variables object -- one node for each field in the previous node's array.
  - The last node's value is a string stating the node in the returned GraphQL object that is required. E.g. `applications.name` Because GraphQL returns results as nested objects, to get an output in a "simple type", a node in the return object tree is needed. (See examples below)
- Output: whatever type is contained in the specified GraphQL node, which can be either `string`, `number`, `boolean`, `array`, or `object`. If the output is an object, it will be returned as follows:
  - If there only one field, only the value of the field will be returned.
  - If there is more than one field, the whole object will be returned.
  - Objects contained within arrays are also returned with the above logic.

# Usage

The query evaluator is implemented in the `evaluateExpression` function:

`evaluateExpression(query: Object, parameters: Object)`

- `query` must contain at least one node with a `value` property, otherwise the function returns `undefined`.
- `parameters` is an object containing a reference to each local data object that is needed for the query, e.g. `user`, `organisation` or `form`. The name of the field must be the object name, i.e.

```
{
  user: "user",
  organisation: "organisation",
  form: "form",
  application: "application"
}
```

- `parameters` can also contain one additional field called `connection`, which is an object representing an active database connection.
- If using one of the database operators (**pgSQL** or **graphQL**), you must also pass a connection object as one of the `parameters`.
  - For **pgSQL**:  
    `pgConnection: <node-postgres Client object>`
  - For **graphQL**:
    `graphQLConnection: {fetch: <fetch object>, endpoint: <URL of GraphQL enpoint>`}

# Examples

There is a **jest** test suite contained with this module’s repo which demonstrates a range of test cases. Here are a few:

### Simple (non-dynamic) examples

**Example 0**: A literal string Label of “First Name”:

```
{
   type: "string", // This is optional
   value: "First Name"
}
```

**Example 00**: Visibility condition for a question that should always be visible:

```
{ value: true }
```

**Example 000:** Array of options for a Dropdown list:

```
{
   type: "array",
   value: ["Pharmaceutical", "Natural Product", "Other"]
}
```

### Dynamic examples

**Example 1**: Concatenation of user’s first and last names

\_Note: <code>user</code> object is passed to <code>evaluateExpression</code> function in the 2nd parameter, \
i.e<code> {user: "user"}</code></em>

Tree structure:

![Example 1 tree diagram](images/query-syntax-example-1.png)

```
{
 type: "string",
 operator: "CONCAT",
 children: [
   {
     operator: "objectProperties",
     children: [{ value: { object: "user", property: "firstName" } }],
   },
   { value: " " },
   {
     operator: "objectProperties",
     children: [{ value: { object: "user", property: "lastName" } }],
   },
 ],
}
```

**Example 2**: Visibility condition: Answer to Q1 (whose `code` is "q1") is "Drug Registration" and user belongs to at least one organisation.

_Note: this query uses PostGres (pgSQL) operator -- in the app, we’ll probably use GraphQL for front-end queries (visibility condition, form elements) and pgSQL for server-side queries (Action conditions)_

Tree structure:

![Example 2 tree diagram](images/query-syntax-example-2.png)

```
{
 operator: "AND",
 children: [
   {
     operator: "=",
     children: [
       {
         operator: "objectProperties",
         children: [
           {
             value: { object: "form", property: "q1" },
           },
         ],
       },
       {
         value: "Drug Registration",
       },
     ],
   },
   {
     operator: "!=",
     children: [
       {
         type: "number",
         operator: "pgSQL",
         children: [
           { value: "SELECT COUNT(*) FROM user_organisation WHERE user_id = $1" },
           {
             operator: "objectProperties",
             children: [{ value: { object: "user", property: "id" } }],
           },
         ],
       },
       {
         type: "number",
         value: 0,
       },
     ],
   },
 ],
}
```

**Example 3**: Validation: Company name is unique (i.e. The total count of Organisations with "name" equal to the value of the question response is zero)

Tree structure:

![Example 3 tree diagram](images/query-syntax-example-3b.png)

```
{
  operator: '=',
  children: [
    {
      operator: 'graphQL',
      children: [
        {
          value: `query Orgs($orgName: String) {
            organisations(condition: {name: $orgName}) {
              totalCount
              nodes {
                name
                id
              }
            }
          }`,
        },
        { value: ['orgName'] },
        {
          operator: 'objectProperties',
          children: [
            {
              value: {
                object: 'form2',
                property: 'q2',
              },
            },
          ],
        },
        { value: 'organisations.totalCount' },
      ],
    },
    { value: 0 },
  ],
}
```

<!-->

**Example 3**: Trigger condition: Stage = SCREENING and All questions are Approved

Tree structure:

![Example 3 tree diagram](images/query-syntax-example-3.png)

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

<-->

# Additional Comments

- The `evaluateExpression` function can take either a javascript object or a stringified JSON as its argument, just in case the JSON blob is extracted from the database as a string.
- The `objectProperties` operator is currently the most uncertain, as it requires local state to be passed to the `evaluateExpression` function in a specific shape. I can’t think of a better way to do this without using `eval` to convert stringified object names to variables. Suggestions welcome.

# To Do

- ~~Convert to typescript.~~
- ~~Make function async and all operators return Promises (currently only pgSQL does, which is not very consistent)~~
- Better error handling
- Create mocks (or alt?) for Database queries in jest test suite
- Figure out how to make into a module that can be easily imported into both front-end and back-end repositories.
- Pass JWT/auth token to database operators
