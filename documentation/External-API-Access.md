If there are external APIs that we wish to query that require authentication, and we have been given system-wide access credentials, we don't want this to be directly available to the front end. So we provide an endpoint to act as a "relay" between the front-end and the third-party API, in which we insert our credentials. We can also apply other restrictions, such as making sure a user can only access results which apply to them and not have unrestricted access to any API query.

The endpoint for this service is:
```
/external-api/<name>/<route>?<...queries>
```

"Name" refers the designated name for the API, as defined in `preferences.json`. "Route" is the specific route on the external server that will be queried.

## Configuration

Configuration for available APIs is defined in `preferences.json` under `server.externalApiConfigs`, with the following basic structure:

```ts
externalApiConfigs : {
    <name>: {
        baseUrl: "<url-of-external-API>",
        authentication: <AuthenticationObject>,
        routes: {...<RouteDefinitions>}
    },
    <anotherName>: ... 
}
```

### Authentication

The `AuthenticationObject` can be one of the following:
```ts
{ type: 'Basic'; username: string; password: string }
{ type: 'Bearer'; token: string }
```

We probably don't want to save passwords of tokens in plain text in our preferences file, so we've provided a mechanism to extract these from environment variables. Prefix any string with `env.` and the subsequent part of string will be replaced by an environment variable of that name, e.g. `password: "env.MY_SECRET"` will use whatever value is currently stored in the `"MY_SECRET"` env variable.

### Route Definitions

Route definitions are defined as follows:

```ts
{
    <route>: {
        method: "get" | "post",
        url: "<routeUrl>",
        queryParams: {
            <key>: <value>,
            ...
        },
        allowedClientQueryParams: [ ...<list-of-keys>],
        permissions: [...<list-of-permissions>],
        returnProperty: string
        validationExpression?: <EvaluatorExpression>
    }
}
```

Looking at these properties in more detail:

- `queryParams`: these are a set of query parameters (`?key=value` in url) that will be inserted into every query to this route. The `value` of each can be an [Evaluator expression](Query-Syntax.md), so they can be generated dynamically for each request. Other query parameters can be supplied by the client request, although the ones defined here will take precedence in the event of the same key being used.
- `allowedClientQueryParams`: if defined, the front-end client can only use these query keys. Any others will be ignored.
- `allowedClientBodyFields`: similar to `allowedClientQueryParams`, but for the JSON fields allowed in a POST request body.
- `permissions`: if defined, the client request must have one of these permissions (in its JWT token) in order to proceed. 
- `returnProperty`: the name of the property from the data returned by the API to return to the client. If the API returns more data than we would like the client to have access to, we could restrict it here. (E.g. `name.lastName`).
- `validationExpression`: an additional [Evaluator expression](Query-Syntax.md) that can further restrict whether the client can receive the requested data. For example, you could use it to make sure their username matches the username of the returned data.


### Evaluator expressions

As mentioned above, the `queryParameters` values and the `validationExpression` can be [Evaluator expressions](Query-Syntax.md). 

The "object" data used by the evaluator is a combination of:
-  the same "applicationData" used by Conforma [Actions](Action-plugin-specification.md), but in order to retrieve this, the `applicationId` must be sent as a url query parameter.
-  "user" data (same as "getUserInfo" returned by Login endpoint) -- the user and organisation ids are extracted from the request JWT token.
-  "functions" -- the same functions provided to other evaluator instances, as defined in `evaluatorFunctions.ts`
-  "result" -- the result of the external API query, so the data can be compared against query or user/application data for validation.

## Example

Here is a full example configuration with a couple of routes. One is very simple, and the other is more complex.

```json
"externalApiConfigs": {
   "MedServer": {
     "baseUrl": "https://private-medical-data.org",
     "authentication": {
       "type": "Basic",
       "username": "conforma",
       "password": "env.MED_DATA_PW"
     },
     "routes": {
       "drugName": {
         "method": "get",
         "url": "drugs",
         "allowedClientQueryParams": [ "name" ],
       },
       "person": {
         "method": "get",
         "url": "person/name",
         "allowedClientQueryParams": [ "id" ],
         "queryParameters": {
            "format": "JSON"
         },
         "permissions": [ "applyMedReg" ],
         "validationExpression": {
           "operator": "=",
           "children": [
             {
               "operator": "objectProperties",
               "children": [
                 "result.data.person.birth_date"
               ]
             },
             {
               "operator": "objectProperties",
               "children": [
                 "query.dob"
               ]
             }
           ]
         },
         "returnProperty": "data.person"
       }
     }
   }
}
```

Let's go through this in more detail:

We're defining two routes to a server at `https://private-medical-data.org`, and we're using basic authentication, of which our password is saved in the environment variable `"MED_DATA_PW"`

### Route #1

The first route is a GET request to `/drugs`, of which the client is allowed to supply a "name" query parameter. So the front-end might request something like this:

```
/external-api/MedServer/drugName?name=paracetamol
```

This would be converted into the following (authenticated) request from Conforma server to the external server:
```
https://private-medical-data.org/drugs?name=paracetamol
```

And then whatever data was returned by request would be served to the client request in full.

### Route #2

The second route definition is a more complex GET request to `/person/name`. Because this endpoint can return confidential personal medical data, we want to add some additional restrictions to prevent clients accessing the wrong people's private data.

- Firstly, the client can only query by `id`
- We will add in the additional query `{ format: "JSON" }` in order to always return JSON data, regardless of what is requested by the client.
- The `permissions` property will check the client request has "applyMedReg" permissions; presumably this request would be coming from an application form with that permission.
- The `validationExpression` checks that the date of birth provided in the url query parameters matches the date of birth returned by the external server, and we only return the result if so. This means that even if a user knows someone else's personal ID, they can only access their information if they also know the correct date of birth for that person.
- Lastly, the `returnProperty` restricts the returned data to just the `data.person` field.

A valid front-end request would be something like:
```
/external-api/MedServer/person?id=XYZ1234&dob=1999-06-05
```

First the server checks the request JWT to make sure it contains the "applyMedReg" permission, and if so, makes the following request to the external server:
```
https://private-medical-data.org/person/name?id=XYZ1234&format=JSON
```

The server then returns the following JSON data:
```json
{
  "data": {
    "health_supplier": {
      "notRelevant": "..."
    },
    "person": {
      "first_name": "Simon",
      "last_name": "Walker",
      "birth_date": "1999-06-05",
      "medical_info": {
        "otherStuff": "..."
      }
    }
  }
}

```

We then check the validation expression -- that the returned `data.person.birth_date` matches the request's `query.dob`. In this case, it does, so we then return just the `data.person` info to the client:
```json
{
    "first_name": "Simon",
    "last_name": "Walker",
    "birth_date": "1999-06-05",
    "medical_info": {
        "otherStuff": "..."
    }
}
```

## Misc

- The endpoint returns a 403 "unauthorized" status if either the permissions or validation expression checks fail, with appropriate message.
- Any errors returned by the external server are passed on directly to the client.
