interface ITestData {
  [key: string]: any
}

export const testData: ITestData = {}

// Basic (single level literals)
testData.basicStringLiteral = {
  type: 'string',
  value: 'First Name',
}

testData.stringifiedBasicStringLiteral = `{
    "type": "string",
    "value": "First Name"
}`

testData.basicStringLiteralNoType = {
  value: 'First Name',
}

testData.basicBoolean = {
  value: true,
}

testData.stringifiedBasicBoolean = `{"value":true}`

testData.basicArray = {
  type: 'array',
  value: ['Pharmaceutical', 'Natural Product', 'Other'],
}

testData.stringifiedBasicArray = '{"value":["Pharmaceutical","Natural Product","Other"]}'

// AND
testData.operatorAND_2values = {
  type: 'boolean',
  operator: 'AND',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

testData.operatorAND_2values_false = {
  type: 'boolean',
  operator: 'AND',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: false,
    },
  ],
}

testData.operatorAND_4values = {
  type: 'boolean',
  operator: 'AND',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

testData.operatorAND_4values_false = {
  type: 'boolean',
  operator: 'AND',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

// OR

testData.operatorOR_2values = {
  type: 'boolean',
  operator: 'OR',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

testData.operatorOR_2values_1false = {
  type: 'boolean',
  operator: 'OR',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: false,
    },
  ],
}

testData.operatorOR_4values = {
  type: 'boolean',
  operator: 'OR',
  children: [
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

testData.operatorOR_4values_1false = {
  type: 'boolean',
  operator: 'OR',
  children: [
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: true,
    },
    {
      type: 'boolean',
      value: true,
    },
  ],
}

testData.operatorOR_4values_false = {
  type: 'boolean',
  operator: 'OR',
  children: [
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: false,
    },
    {
      type: 'boolean',
      value: false,
    },
  ],
}

// CONCAT

testData.CONCAT_2_Arrays = {
  type: 'array',
  operator: 'CONCAT',
  children: [
    {
      type: 'array',
      value: [1, 2, 3],
    },
    {
      value: ['Four', 'Five', 'Six'],
    },
  ],
}

testData.CONCAT_4_Arrays = {
  type: 'array',
  operator: 'CONCAT',
  children: [
    {
      type: 'array',
      value: [1, 2, 3],
    },
    {
      value: ['Four', 'Five', 'Six'],
    },
    {
      value: [7, 8, 'Nine'],
    },
    {
      value: [['Four', 'Five', 'Six'], 'The', 'End'],
    },
  ],
}

testData.CONCAT_3_Strings = {
  type: 'string',
  operator: 'CONCAT',
  children: [
    {
      type: 'string',
      value: 'Carl',
    },
    {
      type: 'string',
      value: ' ',
    },
    {
      value: 'Smith',
    },
  ],
}

testData.CONCAT_4_Unspecified = {
  operator: 'CONCAT',
  children: [
    {
      value: 'Carl',
    },
    {
      type: 'string',
      value: ' ',
    },
    {
      value: 'Smith',
    },
    {
      value: '--XXX',
    },
  ],
}

// Equal

testData.EQUAL_Numbers = {
  operator: '=',
  children: [
    {
      value: 6,
    },
    {
      value: 6,
    },
  ],
}

testData.EQUAL_Numbers_false = {
  operator: '=',
  children: [
    {
      value: 6,
    },
    {
      value: 0,
    },
  ],
}

testData.EQUAL_String = {
  operator: '=',
  children: [
    {
      value: 'Monday 1st January',
    },
    {
      value: 'Monday 1st January',
    },
  ],
}

testData.EQUAL_String_false = {
  operator: '=',
  children: [
    {
      value: 'War and Peace',
    },
    {
      value: 'War and Peas',
    },
  ],
}

testData.EQUAL_Numbers_many = {
  operator: '=',
  children: [
    {
      value: 6,
    },
    {
      value: 6,
    },
    {
      value: 6,
    },
    {
      value: 6,
    },
  ],
}

testData.EQUAL_String_single = {
  operator: '=',
  children: [
    {
      value: 'All by myself',
    },
  ],
}

// Inequality

testData.NOT_EQUAL_Numbers = {
  operator: '!=',
  children: [
    {
      value: 8.7,
    },
    {
      value: 6,
    },
  ],
}

testData.NOT_EQUAL_Numbers_false = {
  operator: '!=',
  children: [
    {
      value: 6,
    },
    {
      value: 6,
    },
  ],
}

testData.NOT_EQUAL_String = {
  operator: '!=',
  children: [
    {
      value: 'Monday 1st January',
    },
    {
      value: 'Tuesday 1st January',
    },
  ],
}

testData.NOT_EQUAL_String_false = {
  operator: '!=',
  children: [
    {
      value: 'The Brothers Karamazov',
    },
    {
      value: 'The Brothers Karamazov',
    },
  ],
}

// PLUS

testData.PLUS_2Nums = {
  operator: '+',
  children: [
    {
      value: 6,
    },
    {
      value: 6,
    },
  ],
}

testData.PLUS_4Nums = {
  operator: '+',
  children: [
    {
      value: 7.5,
    },
    {
      value: 25,
    },
    {
      value: 0.1,
    },
    {
      value: 6,
    },
  ],
}

// REGEX

testData.REGEX_check_email = {
  operator: 'REGEX',
  children: [
    {
      value: 'carl@sussol.net',
    },
    {
      value: '^[A-Za-z0-9.]+@[A-Za-z0-9]+\\.[A-Za-z0-9.]+$',
    },
  ],
}

testData.REGEX_check_email_false = {
  operator: 'REGEX',
  children: [
    {
      value: 'carl@sussol$net',
    },
    {
      value: '^[A-Za-z0-9.]+@[A-Za-z0-9]+\\.[A-Za-z0-9.]+$',
    },
  ],
}

// Return User or Form values

testData.user = {
  id: 2,
  firstName: 'Carl',
  lastName: 'Smith',
  title: 'Import Manager',
}

testData.organisation = {
  id: 1,
  name: 'XYZ Pharmaceuticals',
  category: 'Manufacturers',
}

testData.form = {
  q1: 'Drug Registration',
  q2: 'A',
  q3: 'nobodylikeme@sussol.net',
  q4: 'Panadol',
}

testData.form2 = {
  q1: 'Company Registration',
  q2: 'XYZ Chemicals',
}

testData.application = {
  id: 3,
  name: 'Company Registration',
  status: 'Submitted',
  stage: 1,
  questions: { q1: 'What is the answer?', q2: 'Enter your name' },
}

// Object Properties (simple)

testData.singleUserProperty = {
  operator: 'objectProperties',
  children: [
    {
      value: { objectIndex: 0, property: 'firstName' },
    },
  ],
}

testData.singleApplicationProperty_noIndex_depth2 = {
  operator: 'objectProperties',
  children: [
    {
      value: { property: 'questions.q2' },
    },
  ],
}

// API operator

testData.APIisUnique = {
  operator: 'API',
  children: [
    {
      value: 'http://localhost:8080/check-unique',
    },
    {
      value: ['type', 'value'],
    },
    { value: 'username' },
    { value: 'druglord' },
  ],
}
testData.onlineTestAPI = {
  operator: 'API',
  children: [
    {
      value: 'https://jsonplaceholder.typicode.com/todos/1',
    },
    { value: [] },
    { value: 'title' },
  ],
}
testData.onlineArrayReturn = {
  operator: 'API',
  children: [
    {
      value: 'https://jsonplaceholder.typicode.com/users',
    },
    { value: [] },
  ],
}

// prettier-ignore
testData.onlineArrayReturnResult = [{"address": {"city": "Gwenborough", "geo": {"lat": "-37.3159", "lng": "81.1496"}, "street": "Kulas Light", "suite": "Apt. 556", "zipcode": "92998-3874"}, "company": {"bs": "harness real-time e-markets", "catchPhrase": "Multi-layered client-server neural-net", "name": "Romaguera-Crona"}, "email": "Sincere@april.biz", "id": 1, "name": "Leanne Graham", "phone": "1-770-736-8031 x56442", "username": "Bret", "website": "hildegard.org"}, {"address": {"city": "Wisokyburgh", "geo": {"lat": "-43.9509", "lng": "-34.4618"}, "street": "Victor Plains", "suite": "Suite 879", "zipcode": "90566-7771"}, "company": {"bs": "synergize scalable supply-chains", "catchPhrase": "Proactive didactic contingency", "name": "Deckow-Crist"}, "email": "Shanna@melissa.tv", "id": 2, "name": "Ervin Howell", "phone": "010-692-6593 x09125", "username": "Antonette", "website": "anastasia.net"}, {"address": {"city": "McKenziehaven", "geo": {"lat": "-68.6102", "lng": "-47.0653"}, "street": "Douglas Extension", "suite": "Suite 847", "zipcode": "59590-4157"}, "company": {"bs": "e-enable strategic applications", "catchPhrase": "Face to face bifurcated interface", "name": "Romaguera-Jacobson"}, "email": "Nathan@yesenia.net", "id": 3, "name": "Clementine Bauch", "phone": "1-463-123-4447", "username": "Samantha", "website": "ramiro.info"}, {"address": {"city": "South Elvis", "geo": {"lat": "29.4572", "lng": "-164.2990"}, "street": "Hoeger Mall", "suite": "Apt. 692", "zipcode": "53919-4257"}, "company": {"bs": "transition cutting-edge web services", "catchPhrase": "Multi-tiered zero tolerance productivity", "name": "Robel-Corkery"}, "email": "Julianne.OConner@kory.org", "id": 4, "name": "Patricia Lebsack", "phone": "493-170-9623 x156", "username": "Karianne", "website": "kale.biz"}, {"address": {"city": "Roscoeview", "geo": {"lat": "-31.8129", "lng": "62.5342"}, "street": "Skiles Walks", "suite": "Suite 351", "zipcode": "33263"}, "company": {"bs": "revolutionize end-to-end systems", "catchPhrase": "User-centric fault-tolerant solution", "name": "Keebler LLC"}, "email": "Lucio_Hettinger@annie.ca", "id": 5, "name": "Chelsey Dietrich", "phone": "(254)954-1289", "username": "Kamren", "website": "demarco.info"}, {"address": {"city": "South Christy", "geo": {"lat": "-71.4197", "lng": "71.7478"}, "street": "Norberto Crossing", "suite": "Apt. 950", "zipcode": "23505-1337"}, "company": {"bs": "e-enable innovative applications", "catchPhrase": "Synchronised bottom-line interface", "name": "Considine-Lockman"}, "email": "Karley_Dach@jasper.info", "id": 6, "name": "Mrs. Dennis Schulist", "phone": "1-477-935-8478 x6430", "username": "Leopoldo_Corkery", "website": "ola.org"}, {"address": {"city": "Howemouth", "geo": {"lat": "24.8918", "lng": "21.8984"}, "street": "Rex Trail", "suite": "Suite 280", "zipcode": "58804-1099"}, "company": {"bs": "generate enterprise e-tailers", "catchPhrase": "Configurable multimedia task-force", "name": "Johns Group"}, "email": "Telly.Hoeger@billy.biz", "id": 7, "name": "Kurtis Weissnat", "phone": "210.067.6132", "username": "Elwyn.Skiles", "website": "elvis.io"}, {"address": {"city": "Aliyaview", "geo": {"lat": "-14.3990", "lng": "-120.7677"}, "street": "Ellsworth Summit", "suite": "Suite 729", "zipcode": "45169"}, "company": {"bs": "e-enable extensible e-tailers", "catchPhrase": "Implemented secondary concept", "name": "Abernathy Group"}, "email": "Sherwood@rosamond.me", "id": 8, "name": "Nicholas Runolfsdottir V", "phone": "586.493.6943 x140", "username": "Maxime_Nienow", "website": "jacynthe.com"}, {"address": {"city": "Bartholomebury", "geo": {"lat": "24.6463", "lng": "-168.8889"}, "street": "Dayna Park", "suite": "Suite 449", "zipcode": "76495-3109"}, "company": {"bs": "aggregate real-time technologies", "catchPhrase": "Switchable contextually-based project", "name": "Yost and Sons"}, "email": "Chaim_McDermott@dana.io", "id": 9, "name": "Glenna Reichert", "phone": "(775)976-6794 x41206", "username": "Delphine", "website": "conrad.com"}, {"address": {"city": "Lebsackbury", "geo": {"lat": "-38.2386", "lng": "57.2232"}, "street": "Kattie Turnpike", "suite": "Suite 198", "zipcode": "31428-2261"}, "company": {"bs": "target end-to-end models", "catchPhrase": "Centralized empowering task-force", "name": "Hoeger LLC"}, "email": "Rey.Padberg@karina.biz", "id": 10, "name": "Clementina DuBuque", "phone": "024-648-3804", "username": "Moriah.Stanton", "website": "ambrose.net"}]

testData.onlineArrayNodes = {
  operator: 'API',
  children: [
    {
      value: 'https://jsonplaceholder.typicode.com/albums',
    },
    { value: [] },
    { value: 'title' },
  ],
}

// prettier-ignore
testData.onlineArrayNodesResult = ["quidem molestiae enim", "sunt qui excepturi placeat culpa", "omnis laborum odio", "non esse culpa molestiae omnis sed optio", "eaque aut omnis a", "natus impedit quibusdam illo est", "quibusdam autem aliquid et et quia", "qui fuga est a eum", "saepe unde necessitatibus rem", "distinctio laborum qui", "quam nostrum impedit mollitia quod et dolor", "consequatur autem doloribus natus consectetur", "ab rerum non rerum consequatur ut ea unde", "ducimus molestias eos animi atque nihil", "ut pariatur rerum ipsum natus repellendus praesentium", "voluptatem aut maxime inventore autem magnam atque repellat", "aut minima voluptatem ut velit", "nesciunt quia et doloremque", "velit pariatur quaerat similique libero omnis quia", "voluptas rerum iure ut enim", "repudiandae voluptatem optio est consequatur rem in temporibus et", "et rem non provident vel ut", "incidunt quisquam hic adipisci sequi", "dolores ut et facere placeat", "vero maxime id possimus sunt neque et consequatur", "quibusdam saepe ipsa vel harum", "id non nostrum expedita", "omnis neque exercitationem sed dolor atque maxime aut cum", "inventore ut quasi magnam itaque est fugit", "tempora assumenda et similique odit distinctio error", "adipisci laborum fuga laboriosam", "reiciendis dolores a ut qui debitis non quo labore", "iste eos nostrum", "cumque voluptatibus rerum architecto blanditiis", "et impedit nisi quae magni necessitatibus sed aut pariatur", "nihil cupiditate voluptate neque", "est placeat dicta ut nisi rerum iste", "unde a sequi id", "ratione porro illum labore eum aperiam sed", "voluptas neque et sint aut quo odit", "ea voluptates maiores eos accusantium officiis tempore mollitia consequatur", "tenetur explicabo ea", "aperiam doloremque nihil", "sapiente cum numquam officia consequatur vel natus quos suscipit", "tenetur quos ea unde est enim corrupti qui", "molestiae voluptate non", "temporibus molestiae aut", "modi consequatur culpa aut quam soluta alias perspiciatis laudantium", "ut aut vero repudiandae voluptas ullam voluptas at consequatur", "sed qui sed quas sit ducimus dolor", "odit laboriosam sint quia cupiditate animi quis", "necessitatibus quas et sunt at voluptatem", "est vel sequi voluptatem nemo quam molestiae modi enim", "aut non illo amet perferendis", "qui culpa itaque omnis in nesciunt architecto error", "omnis qui maiores tempora officiis omnis rerum sed repellat", "libero excepturi voluptatem est architecto quae voluptatum officia tempora", "nulla illo consequatur aspernatur veritatis aut error delectus et", "eligendi similique provident nihil", "omnis mollitia sunt aliquid eum consequatur fugit minus laudantium", "delectus iusto et", "eos ea non recusandae iste ut quasi", "velit est quam", "autem voluptatem amet iure quae", "voluptates delectus iure iste qui", "velit sed quia dolor dolores delectus", "ad voluptas nostrum et nihil", "qui quasi nihil aut voluptatum sit dolore minima", "qui aut est", "et deleniti unde", "et vel corporis", "unde exercitationem ut", "quos omnis officia", "quia est eius vitae dolor", "aut quia expedita non", "dolorem magnam facere itaque ut reprehenderit tenetur corrupti", "cupiditate sapiente maiores iusto ducimus cum excepturi veritatis quia", "est minima eius possimus ea ratione velit et", "ipsa quae voluptas natus ut suscipit soluta quia quidem", "id nihil reprehenderit", "quibusdam sapiente et", "recusandae consequatur vel amet unde", "aperiam odio fugiat", "est et at eos expedita", "qui voluptatem consequatur aut ab quis temporibus praesentium", "eligendi mollitia alias aspernatur vel ut iusto", "aut aut architecto", "quas perspiciatis optio", "sit optio id voluptatem est eum et", "est vel dignissimos", "repellendus praesentium debitis officiis", "incidunt et et eligendi assumenda soluta quia recusandae", "nisi qui dolores perspiciatis", "quisquam a dolores et earum vitae", "consectetur vel rerum qui aperiam modi eos aspernatur ipsa", "unde et ut molestiae est molestias voluptatem sint", "est quod aut", "omnis quia possimus nesciunt deleniti assumenda sed autem", "consectetur ut id impedit dolores sit ad ex aut", "enim repellat iste"]

// SQL operator

testData.getApplicationName = {
  type: 'string',
  operator: 'pgSQL',
  children: [
    {
      value: 'SELECT name FROM application WHERE template_id = $1',
    },
    {
      value: 2,
    },
  ],
}

testData.getListOfTemplates = {
  type: 'array',
  operator: 'pgSQL',
  children: [
    {
      value: 'SELECT name FROM template',
    },
  ],
}

testData.countTemplates = {
  type: 'number',
  operator: 'pgSQL',
  children: [
    {
      value: 'SELECT count(*) FROM template',
    },
  ],
}

testData.getListOfTemplates_noType = {
  operator: 'pgSQL',
  children: [
    {
      value: 'SELECT name FROM template',
    },
  ],
}

testData.getListOfApplications_withId = {
  operator: 'pgSQL',
  children: [
    {
      value: 'SELECT id, name FROM application',
    },
  ],
}

// GraphQL operator

testData.simpleGraphQL = {
  operator: 'graphQL',
  children: [
    {
      value: `query App($appId:Int!) {
        application(id: $appId) {
          name
        }
      }`,
    },
    { value: ['appId'] },
    { value: 1 },
    { value: 'application.name' },
  ],
}

testData.GraphQL_listOfApplications = {
  operator: 'graphQL',
  children: [
    {
      value: `query Apps {
      applications {
        nodes {
          name
        }
      }
    }`,
    },
    { value: [] },
    { value: 'applications.nodes' },
  ],
}

testData.GraphQL_listOfApplicationsWithId = {
  operator: 'graphQL',
  children: [
    {
      value: `query Apps {
        applications {
          nodes {
            name
            id
          }
        }
      }`,
    },
    { value: [] },
    { value: 'applications.nodes' },
  ],
}

testData.GraphQL_listOfTemplates_noReturnSpecified = {
  operator: 'graphQL',
  children: [
    {
      value: `query Templates {
        templates {
          edges {
            node {
              name
            }
          }
        }
      }`,
    },
    { value: [] },
  ],
}

testData.GraphQL_CountApplicationSections = {
  operator: 'graphQL',
  children: [
    {
      value: `query SectionCount($appId:Int!) {
        application(id: $appId) {
          id
          template {
            name
          }
          applicationSections {
            totalCount
          }
        }
      }`,
    },
    { value: ['appId'] },
    {
      operator: 'objectProperties',
      children: [{ value: { property: 'id' } }],
    },
    { value: 'application.applicationSections.totalCount' },
  ],
}

// More complex combinations

testData.concatFirstAndLastNames = {
  type: 'string',
  operator: 'CONCAT',
  children: [
    {
      operator: 'objectProperties',
      children: [{ value: { property: 'firstName' } }],
    },
    {
      value: ' ',
    },
    {
      operator: 'objectProperties',
      children: [{ value: { property: 'lastName' } }],
    },
  ],
}

testData.emailValidation = {
  operator: 'AND',
  children: [
    {
      operator: 'REGEX',
      children: [
        {
          operator: 'objectProperties',
          children: [{ value: { property: 'q3' } }],
        },
        {
          value: '^[A-Za-z0-9.]+@[A-Za-z0-9]+\\.[A-Za-z0-9.]+$',
        },
      ],
    },
    {
      operator: 'API',
      children: [
        {
          value: 'http://localhost:8080/check-unique',
        },
        {
          value: ['type', 'value'],
        },
        { value: 'email' },
        {
          operator: 'objectProperties',
          children: [{ value: { property: 'q3' } }],
        },
        { value: 'unique' },
      ],
    },
  ],
}

testData.complex1 = {
  operator: 'AND',
  children: [
    {
      operator: '=',
      children: [
        {
          operator: 'objectProperties',
          children: [
            {
              value: { objectIndex: 0, property: 'q1' },
            },
          ],
        },
        {
          value: 'Drug Registration',
        },
      ],
    },
    {
      operator: '!=',
      children: [
        {
          type: 'number',
          operator: 'pgSQL',
          children: [
            { value: 'SELECT COUNT(*) FROM user_organisation WHERE user_id = $1' },
            {
              operator: 'objectProperties',
              children: [{ value: { objectIndex: 1, property: 'id' } }],
            },
          ],
        },
        {
          type: 'number',
          value: 0,
        },
      ],
    },
  ],
}

testData.complex2 = {
  operator: 'AND',
  children: [
    {
      operator: '=',
      children: [
        {
          operator: 'objectProperties',
          children: [{ value: { object: 'application', property: 'stage' } }],
        },
        {
          value: 1,
        },
      ],
    },
    {
      operator: '=',
      children: [
        {
          operator: 'graphQL',
          children: [
            {
              value:
                'Graph QL to return COUNT of questions for current application that are NOT Approved',
            },
            { value: { object: 'application', property: 'id' } },
          ],
        },
        {
          value: 0,
        },
      ],
    },
  ],
}

testData.complex2_asString = `{
    "operator": "AND",
    "children": [
      {
        "operator": "=",
        "children": [
          {
            "operator": "objectProperties",
            "children": [
              {
                "value": {
                  "object": "application",
                  "property": "stage"
                }
              }
            ]
          },
          {
            "value": 1
          }
        ]
      },
      {
        "operator": "=",
        "children": [
          {
            "operator": "graphQL",
            "children": [
              {
                "value": "Graph QL to return COUNT of questions for current application that are NOT Approved"
              },
              {
                "value": {
                  "object": "user",
                  "property": "id"
                }
              },
              {
                "value": {
                  "object": "application",
                  "property": "id"
                }
              }
            ]
          },
          {
            "value": 0
          }
        ]
      }
    ]
  }`

testData.complexValidation = {
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
          children: [{ value: { property: 'q2' } }],
        },
        { value: 'organisations.totalCount' },
      ],
    },
    { value: 0 },
  ],
}
