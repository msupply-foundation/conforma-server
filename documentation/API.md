# API specification

Up-to-date documentation of all endpoints and back-end services for reference of front-end devs.

The back-end currently has two server instances which are launched to handle incoming requests:

- [**Postgraphile**](https://www.graphile.org/postgraphile/) server -- exposes a **GraphQL** endpoint and uses GraphQL queries to access the **PostGres** database.
- [**Fastify**](https://www.fastify.io/) server -- additional endpoints for various services. (Will also serve the actual app when deployed, and will probably have PostGraphile added as a plugin later in development)

---

## Postgraphile server API:

`http://localhost:5000/graphql`

Web-based GUI available at:  
`http://localhost:5000/graphiql`

---

## Fastify server API

`http://localhost:8080` (In Development environment)

### Authentication

Endpoints are divided into three group, as far as authentication goes:

- **Public** -- no authentication required
- **Authenticated** -- valid JWT for user required (including nonRegistered user)
- **Admin** -- requires Admin permission (`isAdmin: true` in JWT)

---
### Public endpoints

All are prefixed with `/api/public` e.g `http://localhost:8080/api/public/login`

#### Login

POST: `/login`

Basic login endpoint that will also return (on success):

- User Info
- User Permissions
- JWT token

##### REQUEST Body:

```JSON
{
    "username": "${username}",
    "password": "${password}"
}
```

##### RESPONSE Body (example):

```JSON
{
    "success": true,
    "templatePermissions": {
        "TestRego": [
            "Apply"
        ],
        "CompRego1": [
            "Apply",
            "Review"
        ]
    },
    "JWT": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcDNwbjN0cDMiOnRydWUsInBwM3BuM3RwM19zdGFnZSI6IjEiLCJwcDNwbjN0cDNfdGVtcGxhdGVJZCI6IjIiLCJwcDNwbjMiOnRydWUsInBwMnBuMnRwMiI6dHJ1ZSwicHAycG4ydHAyX3RlbXBsYXRlSWQiOiIyIiwicHAycG4yIjp0cnVlLCJwcDFwbjF0cDEiOnRydWUsInBwMXBuMXRwMV90ZW1wbGF0ZUlkIjoiMSIsInBwMXBuMSI6dHJ1ZSwidXNlcklkIjoxMCwiYXVkIjoicG9zdGdyYXBoaWxlIiwiaWF0IjoxNjEwMDYwMTQxfQ.X8E7CpwRfVNHgm5wW6Qxp122vZmLr8cwipPXFcx_YUo",
    "user": {
        "id": 10,
        "firstName": null,
        "lastName": null,
        "userId": 10,
        "username": "userWithMultiplePermissions",
        "dateOfBirth": null,
        "email": null
    }
}
```

#### Get preferences endpoint:

GET: `/get-prefs`

Provides current preferences and language options for the current installation. Called by front-end at the very start of loading in order to configure the environment according to system settings.

#### Get language endpoint:

GET: `/language/<langauge-code>`

Gets the set of localised strings for the core application (i.e. not customisable entities like templates).

#### Verification endpoint

GET: `/verify?uid=<uniqueid>`

Sets the verification record at `<uniqueid>` to `true` and triggers configured Action. Used for verification via email, etc. See [Create Verification Action](List-of-Action-plugins.md) for more info.

#### File download endpoint:

GET: `/file?id=<uniqueId>`

Usage: `GET` request with file database id as a URL query parameter.

This is a public endpoint, but files all have a long uniqueId which should prevent unauthorized access.s
---
### Authenticated endpoints

These are all prefixes with `/api`, e.g. `http://localhost:8080/api/login-org`

They require a valid JWT supplied as a Bearer token in the authorization header of the request:

```
Authorization: Bearer <token>
```

#### File upload endpoint:

POST: `/upload`

Usage: `POST` request with file(s) in the request `body` form-data:  
`key: "file" value: <File(s)>`

URL query paramter fields (optional):

- `user_id`
- `application_serial`
- `application_response_id`

e.g. `/upload?user=2&application_serial=3`

Files are uploaded to `src/files` with their database table id appended to the filename (to ensure uniqueness).

#### Check unique endpoint

GET: `/check-unique`

Endpoint to check if an entity (e.g. username, email) is unique in the system. Needed because the front-end user won't have permission to query the full list of records, only ones they have permission for.

Query parameters:

- `type`: available options: `username`, `email`, `organisation`
- `value`: the value being checked for uniqueness
- `table`: the database table to check
- `field`: the field in the above table to check

Note that `table` and `field` are only required when `type` is not specified -- `type` is basically a table/field shorthand for "username", "email" and "organisation" checks; for any other checks, use `table` and `field`.

Example request URL: `/check-unique/type=email&value=carl@sussol.net`

Check is case-insensitive, so `user99` will return **Not Unique** if `User99` is in the database.

Request will return an object, structured like so:

```
{
  unique: true/false
  message: "Type missing or invalid"/"Value not provided", or <empty string> if all okay
}
```

There are basic unit tests for this endpoint. Run:  
`yarn test src/server.test.ts`



#### Login Organisation

POST: `/login-org`

Basic login endpoint for organisation. Intended for use after `/login` -- client supplies `userId`, `orgId` and the JWT from `/login` return

Returns (on success):

- User Info (now including selected org info)
- User Permissions (now including `orgId`)
- JWT token

#### User Info

GET: `/userInfo`

End point to get user permission and info based on JWT token.

If JWT is invalid or is missing 'nonRegistered' user info will be returned.

##### RESPONSE Body:

The same as login endpoint, without the success field

#### Generate PDF

POST: `/generate-pdf`

Endpoint to generate PDF files based on a [Carbone template](https://carbone.io/api-reference.html).

**Parameters** (as body JSON):

- `fileId` -- uniqueId of the carbone template file (from the "file" table)
- `data` -- object containing all the data to be used for substitutions in the carbone template
- `userId` / `applicationSerial` / `templateId` -- not required, but will be added to the resulting "file" record of the generated document. Note: it is not recommended to add `templateId` to files generated for applications; it should be reserved for files directly associated with templates, such as carbone document templates.
- `subfolder` -- will save output file into a subfolder if `applicationSerial` is not supplied

The return object contains:

```
{ uniqueId, filename, filePath }
```

The internal function called by this endpoint is the same one run by the ["generateDoc" action](List-of-Action-plugins.md).

### Outcomes

GET:
`/outcomes`
`/outcomes/table/<tableName>`
`/outcomes/table/<tableName>/item/<id>`

For displaying Outcome data (e.g. Users, Products, Orgs). User's JWT determines what they are allowed to see, and data is returned accordingly.

Please see [Outcomes Display](Outcomes-Display.md) for more info.

---

### Admin only endpoints

These are all prefixed with `/api/admin/` e..g `http://localhost:8080/api/admin/updateRowPolicies`

They require a valid JWT with the `isAdmin` field set to `true` (which means user has "Admin" permissions)

#### Update row level policies

GET: `/updateRowPolicies`

End point to refresh row level policies. Will drop all previosly generated policies and re-create a new.
Should be called anytime these change:

- template_permissions
- permission_name
- permission_policy

see [Permission Docs](Database-Schema-Permission.md) for more details

##### RESPONSE Body:

A json array of new policies:

```JSON
[
    "CREATE POLICY \"view_pp1pn1\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp1pn1') = true and template_id = jwt_get_bigint('pp1pn1_templateId')) ",
    "CREATE POLICY \"view_pp1pn1tp1\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp1pn1tp1') = true and template_id = jwt_get_bigint('pp1pn1tp1_templateId')) ",
    "CREATE POLICY \"view_pp2pn2\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp2pn2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2_templateId')) ",
    "CREATE POLICY \"view_pp2pn2tp2\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')) ",
    "CREATE POLICY \"view_pp3pn3\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp3pn3') = true and template_id = jwt_get_bigint('pp3pn3_templateId')) ",
    "CREATE POLICY \"view_pp3pn3tp3\" ON \"application\" FOR SELECT USING (jwt_get_boolean('pp3pn3tp3') = true and template_id = jwt_get_bigint('pp3pn3tp3_templateId')) "
]
```

#### Run Action

POST: `/run-action`

End point to run Actions[Triggers-and-Actions.md] in isolation. Returns the action's "Output" object.

**Parameters** (as body JSON):

- `actionCode` -- code of the required action (e.g. "incrementStage")
- `applicationId` -- used to fetch `applicationData`, which is required by most actions. If omitted, `applicationData` will not be passed to action, which _may_ cause problems..
- `parameters` -- the input parameters of the specified action.

**Example**:

```
{
    "actionCode": "generateTextString",
    "applicationId": 4001,
    "parameters": {
        "pattern": "<?templateName>-<?productName>",
        "customFields": {
            "templateName": "applicationData.templateName",
            "productName": "applicationData.responses.Q20.text"
        }
    }
}
```

returns:

```
{
    "status": "SUCCESS",
    "error_log": "",
    "output": {
        "generatedText": "Test -- Review Process-Vitamin B"
    }
}
```

#### Snapshot endpoints

- GET: `/snapshots/list`
- POST: `/snapshots/take`
- POST: `/snapshots/use`
- POST: `/snapshots/upload`
- POST: `/snapshots/delete`

See [Snapshot documentation](Snapshots.md) for more info

#### Lookup table endpoints

- POST: `/lookup-table/import`
- GET: `/lookup-table/export`

See [Lookup table documentation](Lookup-Tables.md) for more info