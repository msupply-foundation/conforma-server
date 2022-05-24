# API specification

Up-to-date documentation of all endpoints and back-end services for reference of front-end devs.

The back-end currently has two server instances which are launched to handle incoming requests:

- [**Postgraphile**](https://www.graphile.org/postgraphile/) server -- exposes a **GraphQL** endpoint and uses GraphQL queries to access the **PostGres** database.
- [**Fastify**](https://www.fastify.io/) server -- additional endpoints for various services. (Will also serve the actual app when deployed, and will probably have PostGraphile added as a plugin later in development)

---
## Contents

<!-- toc -->

- [API specification](#api-specification)
  - [Contents](#contents)
  - [Postgraphile server API:](#postgraphile-server-api)
  - [Fastify server API](#fastify-server-api)
    - [Authentication](#authentication)
    - [Public endpoints](#public-endpoints)
      - [Login](#login)
      - [Get preferences endpoint:](#get-preferences-endpoint)
      - [Get language endpoint:](#get-language-endpoint)
      - [Verification endpoint](#verification-endpoint)
      - [File download endpoint:](#file-download-endpoint)
    - [Authenticated endpoints](#authenticated-endpoints)
      - [File upload endpoint:](#file-upload-endpoint)
      - [Check unique endpoint](#check-unique-endpoint)
      - [Login Organisation](#login-organisation)
      - [User Info](#user-info)
      - [User Permissions](#user-permissions)
      - [Check Triggers](#check-triggers)
      - [Generate PDF](#generate-pdf)
    - [Outcomes](#outcomes)
    - [Admin only endpoints](#admin-only-endpoints)
      - [Update row level policies](#update-row-level-policies)
      - [Run Action](#run-action)
      - [Manage localisations](#manage-localisations)
      - [Snapshot endpoints](#snapshot-endpoints)
      - [Lookup table endpoints](#lookup-table-endpoints)

<!-- tocstop -->

## Postgraphile server API:

`http://localhost:5000/graphql` (in Development environment)  
`http://localhost:5000/postgraphile/graphql` (in Production environment)

Web-based GUI available at:  
`http://localhost:5000/graphiql` (development only)

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

GET: `/language/<language-code>`

e.g. `/language/en_nz` (the default language setting)

Gets the set of localised strings for the core application (i.e. not customisable entities like templates).

#### Verification endpoint

GET: `/verify?uid=<uniqueid>`

Sets the verification record at `<uniqueid>` to `true` and triggers configured Action. Used for verification via email, etc. See [Create Verification Action](List-of-Action-plugins.md) for more info.

#### File download endpoint:

GET: `/file?id=<uniqueId>`

Usage: `GET` request with file database id as a URL query parameter.

*This is a public endpoint, but files all have a long uniqueId which should prevent unauthorized access.*

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

URL query paramter fields (all optional):

- `user_id`
- `application_serial` (for associating files with their applications)
- `application_response_id` (for specifying what response a file belongs to, useful for the file "clean-up" action)
- `unique_id` (the randomly generated one should normally be sufficient. If this is specifed and the id already exists in the database, the file record will be *updated* with the new file data.)
- `template_id` (to associate a file with a template, for example a carbone template doc)
- `subfolder` (files are placed in subfolder based on the application_serial provided, but a specific subfolder can be defined instead (which over-rides the application subfolder))

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

GET: `/user-info`

End point to get user permission and info based on JWT token.

If JWT is invalid or is missing 'nonRegistered' user info will be returned.

##### RESPONSE Body:

The same as login endpoint, without the success field

#### User Permissions

GET: `/user-permissions?username=<username>&orgId=<orgId>`

End point to get **another** user's granted permissions + all existing permissions on templates for a given organisation. Intended for use in template to view/edit another user's permissions -- client supplies `username` and `orgId`.

Either `username` or `orgId` can be omitted and the result returned will be either: 
  * for that user without an org; or 
  * for that org without a user. 
  
For `orgId`, the values `null` or `0` are equivalent to omitting `orgId` and for `username` an empty string `""` can be used. This is useful in cases such as a template query where you're supplying an `orgId` and `username` parameter, but can't "turn off" the parameters when you want to omit either of them -- just use `orgId=null` or `username=""` to achieve the same thing.

#### Check Triggers

GET: `/check-trigger?serial=<applicationSerial>`

This endpoint is used by the front-end application loader to ensure that ALL triggers associated with an application (i.e. review assignments, reviews, verifications) are not runninng before the application data is fetched. This is so any mutations that cause Actions to run are all finished before any subsequent data is re-fetched, so the front-end shows all the changes.

The front-end processes this data in the `useTriggers` hook.

##### RESPONSE Body:

```
{
    "status": "ready" | "processing" | "error",
    "errors": // only present if status: "error"
        [
            {
                "table": "application",
                "id": 236,
                "trigger": "ERROR"
            }
        ] 
}
```

##### usage

GET: `/user-permissions?username=<username>` If no `orgId` is received the list should contain user-only permissions (the ones with organisation_id = NULL) for external users.

GET: `/user-permissions?orgId=<orgId>` If no `username` is received (it has to receive orgId in this case) list all available permissions for an org (checking whether is if internal or external)

**Note**: When using this endpoint to list permissionNames in organisation, they will be listed as `availablePermissions`.

Returns (on success):

- template permissions for organisation (using `is_system_org` to filter internal/external permissionNames)
  - id (permissionNameId)
  - name (to be used in the action to be granting the user's permission)
  - displayName (just the **name** field written with spaces)
  - description (new field)
  - isUserGranted (**true/false** - similar to what is in next two arrays)
  - TemplateCodes - Array with all templates linked to this permission
- granted permissions to user
  - Permissions names user **has** been granted permission
- available permissions for user
  - Permissions names user **hasn't** been granted permission

##### RESPONSE Body (example):

```JSON
{
    "templatePermissions":
    [
        {
            "id": 1,
            "name": "applyTestRego",
            "displayName": "Apply Test Rego",
            "description": "Permission for external user to apply for a Test template of user registration",
            "isUserGranted": true,
            "templateCodes": [ "UserRegistration" ]
        },
        {
            "id": 2,
            "name": "applyCompanyRegistration",
            "displayName": "Apply Company Registration",
            "description": "Permission for external user to apply for Company registration template",
            "isUserGranted": false,
            "templateCodes": [ "CompanyRegistration" ]
        }
    ],
   "grantedPermissions":
   [
      "applyTestRego"
   ],
   "availablePermissions":
   [
       "applyCompanyRegistration"
   ]
}
```

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

End point to run [Actions](Triggers-and-Actions.md) in isolation. Returns the action's "Output" object.

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

#### Manage localisations

Used by the front-end `/admin/localisations` page

POST: `/enable-language?code=<languageCode>&enabled=<true/false>`
- To enable or disable a language that is already installed. If parameter `enabled` is omitted, the current setting will be toggled.

POST: `/install-language`
- To install a a new language into the system.

GET: `/all-languages`
- Fetches all languages in a single bundle. Used by the "Export as CSV" feature.

**Input parameters** (as body JSON) example:
```
{
    "language": {
        "languageName": "Portuguese",
        "description": "Portuguese translation",
        "code": "pt_br",
        "flag": "🇧🇷",
        "enabled": true
    },
    "strings": {
        "ACTION_ASSIGN": "Atribuir",
        "ACTION_CONTINUE": "Continuar"
        ...
    }
}
```

**Returns**:
```
{
    "success": true,
    "message": "Language installed: Portuguese / pt_br"
}
```

POST: `/remove-language?code=<languageCode>`
- uninstalls the language from the server

#### Snapshot endpoints

- GET: `/snapshot/list`
- POST: `/snapshot/take`
- POST: `/snapshot/use`
- POST: `/snapshot/upload`
- POST: `/snapshot/delete`

See [Snapshot documentation](Snapshots.md) for more info

#### Lookup table endpoints

- POST: `/lookup-table/import`
- GET: `/lookup-table/export`

See [Lookup table documentation](Lookup-Tables.md) for more info
