# API specification

Up-to-date documentation of all endpoints and back-end services for reference of front-end devs.

The back-end currently has two server instances which are launched to handle incoming requests:

- [**Postgraphile**](https://www.graphile.org/postgraphile/) server -- exposes a **GraphQL** endpoint and uses GraphQL queries to access the **PostGres** database.
- [**Fastify**](https://www.fastify.io/) server -- additional endpoints for various services. (Will also serve the actual app when deployed, and will probably have PostGraphile added as a plugin later in development)

---

### Postgraphile server API:

`http://localhost:5000/graphql`

Web-based GUI available at:  
`http://localhost:5000/graphiql`

---

### Fastify server API

`http://localhost:8080`

#### File upload endpoint:

`/upload`

Usage: `POST` request with file(s) in the request `body` form-data:  
`key: "file" value: <File(s)>`

Additional (optional) fields:

- `user_id`
- `application_id`
- `application_response_id`

Note: optional fields can be supplied _either_ as additional `key/value `pairs in the request `body` _or_ as `query parameters`  
e.g. `/upload?user=2&application_id=3`

Files are uploaded to `src/files` with their database table id appended to the filename (to ensure uniqueness).

#### File download endpoint:

`/file?id=XX`

Usage: `GET` request with file database id as a URL query parameter.

**To-do**: authentication/permission checks for file access.

#### Check unique endpoint

`/check-unique`

Endpoint to check if a username/email/org name is unique in the system. Needed because the front-end user won't have permission to query the full list of records, only ones they have permission for.

Query parameters:

- `type`: available options: `username`, `email`, `organisation`
- `value`: the value being checked for uniqueness

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

##### REQUEST Headers:

```
Authorization: Bearer ${token}
```

##### RESPONSE Body:

The same as login endpoint, without the success field

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

**To-do**: authorisation of some sort (use JWT, and some way to define ADMIN user, maybe boolean on permission_policy)

**To-do**: fine grained change vs dropping all and reinstating them
