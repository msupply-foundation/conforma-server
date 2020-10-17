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
