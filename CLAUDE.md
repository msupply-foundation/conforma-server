# Conforma server — agent & developer guide

Node/TypeScript backend for Conforma: a **Fastify 4** app that mounts **PostGraphile 4** over **PostgreSQL**. The GraphQL API is auto-generated from the database schema; security is enforced by Postgres **row-level security (RLS)** driven by JWT claims. Configurable application/review workflows are defined as data ("templates") and extended through **action plugins**.

> This is one of two sibling repos. The frontend is `conforma-web-app/` (React). They share **no TypeScript** — the contract between them is the generated GraphQL schema. See the cross-repo layout in [../CLAUDE.md](../CLAUDE.md). API-shape changes (column renames, new RLS, new fields) usually require regenerating types and updating queries in **both** repos.

## Nested guides (read these when working in their area)

- [database/CLAUDE.md](database/CLAUDE.md) — schema source of truth, migrations, snapshots
- [src/components/actions/CLAUDE.md](src/components/actions/CLAUDE.md) — triggers → actions runtime, scheduler
- [plugins/CLAUDE.md](plugins/CLAUDE.md) — how to write & build an action plugin
- [src/components/permissions/CLAUDE.md](src/components/permissions/CLAUDE.md) — permission model, JWT, RLS generation, **security**

## Deeper reference docs

Extensive developer docs live in [documentation/](documentation/) (also published to the [GitHub wiki](https://github.com/msupply-foundation/conforma-server/wiki) via the `documentation/_wiki` submodule). Start with [documentation/Glossary.md](documentation/Glossary.md) for the domain vocabulary and [documentation/Home.md](documentation/Home.md) for the index. **CLAUDE.md files orient you and point at code; the `documentation/` folder is the long-form reference.** Note: the `Database-Schema-*.md` pages are conceptually correct but stale in specifics — the SQL files are the real source of truth (see [database/CLAUDE.md](database/CLAUDE.md)).

## Commands

Run from the repo root with **yarn** (Node 20 or later — `.nvmrc` has the baseline version).

| Command | What it does |
| --- | --- |
| `yarn dev` | Dev server via nodemon + ts-node (recompiles on change). **Runs the REST API and GraphQL in one process.** |
| `yarn build` | Compiles everything to `build/` via `utils/build_all.sh` (also builds plugins). |
| `yarn serve` | Run a compiled build: copies prefs/config into `build/`, then runs `build/src/server.js`. |
| `yarn test` | Jest (`--runInBand`). Tests live next to code as `*.test.ts` and under `tests/` folders. |
| `yarn generate` | GraphQL codegen → `src/generated/graphql.ts`. **Requires the server running** (introspects `localhost:8080/graphql`). Re-run after any DB schema change. |
| `yarn migrate` | Run DB migrations to the current app version without a release (see [database/CLAUDE.md](database/CLAUDE.md)). |
| `yarn snapshot [take\|use] [name]` | Take/restore a DB+files snapshot. |
| `yarn database_init` | Initialise the dev DB by restoring a snapshot (= `yarn snapshot use`). |
| `yarn build_plugins` | Recompile all action plugins (each is a standalone package). |
| `yarn dockerise` / `yarn docker_run` | Build/run the Docker image (`docker/`). |

> ⚠️ The [README.md](README.md) lists `yarn pg`, `yarn dev_pg`, `yarn pg_permissions` for running PostGraphile in a **separate** process. **Those scripts no longer exist** — PostGraphile is now mounted in-process inside [src/server.ts](src/server.ts) (`pgMiddleware` from [src/postgraphile.ts](src/postgraphile.ts)). Just `yarn dev`.
>
> ⚠️ `yarn start` is currently broken — it runs `node server.js` from `build/`, but the compiled entry is `build/src/server.js`. Use `yarn serve` to run a compiled build.

### Setup prerequisites

- PostgreSQL with `psql` available and a `postgres` superuser; the app DB is `tmf_app_manager` (connection string is currently **hard-coded** in [src/postgraphile.ts](src/postgraphile.ts)).
- A `.env` file. `WEB_HOST` is **required** — the server exits on startup without it. `JWT_SECRET` falls back to `'devsecret'` whenever it is unset (no environment gating — an unset secret in production silently uses the dev default).

## Architecture

### Startup sequence ([src/server.ts](src/server.ts) → `startServer`)

`migrateData()` → `loadActionPlugins()` (connects DB, starts listening for triggers) → `loadStartupSnapshot()` (fresh installs only) → create data folders → `cleanupDataTables()` → `updateRowPolicies()` (regenerate RLS) → build the Fastify instance → mount PostGraphile → register the `/api` plugin → listen on `config.RESTport` (default **8080**).

### Two surfaces on one server

1. **REST API** under `/api`, defined inline in [src/server.ts](src/server.ts). A `preValidation` hook parses the JWT into `request.auth` for everything **except** `/api/public/*`. Three tiers:
   - `/api/public/*` — no auth (login, file download, language files, fragments, prefs).
   - `/api/admin/*` — requires `request.auth.isAdmin` (snapshots, template import/export, prefs, dev-only `run-action`/`test-trigger`).
   - `/api/*` — valid JWT required (user-info, data-views, uploads, lookup-table, localisation, external-api proxy, …).
   - Route handlers live in `src/components/<feature>/routes.ts` and are imported into `server.ts`. To add a route, write the handler in its component and register it in the `api` plugin callback under the right tier.
2. **GraphQL** at `/graphql` (+ `/graphiql` IDE in dev). This is **not** behind the REST `preValidation` hook — PostGraphile verifies the JWT itself and enforces access purely through Postgres RLS. **A direct GraphQL call bypasses REST route guards**; never assume a REST-layer check protects data reachable via GraphQL.

Both surfaces sit behind one root-level `onRequest` hook that turns the auth cookie into an `Authorization: Bearer` header and silently re-mints an expired token against the session table (`src/components/permissions/accessTokenMiddleware.ts`). It is *not* a guard — it only supplies the token; RLS and the REST tiers still decide what that token can do.

### The core idea: schema-driven API + RLS

The Postgres schema *is* the API. PostGraphile reflects tables/views into GraphQL. Security is mostly **not** in application code — it's RLS policies generated from the permissions configuration and evaluated against `jwt.claims.*`. See [database/CLAUDE.md](database/CLAUDE.md) and [src/components/permissions/CLAUDE.md](src/components/permissions/CLAUDE.md).

### Domain model (one line each — full glossary in [documentation/Glossary.md](documentation/Glossary.md))

**Template** (a configurable form/workflow) → **Application** (an instance, with **Responses** to **Elements/Questions**, organised into **Sections**/**Pages**, progressing through **Stages**/**Status**). **Reviews** (and consolidation) assess applications via **Review Assignments**. **Triggers** fire **Actions** (plugins) on events. **Permissions** (policies + names + joins) gate who can do what, enforced via RLS.

## Codebase map

```
src/
  server.ts              Fastify bootstrap, route registration, auth hook  (start here)
  postgraphile.ts        PostGraphile middleware (in-process GraphQL); hard-coded DB string
  config.ts              Global config object; merges preferences + env overrides
  constants.ts           Folder paths (resolved at import time), defaults
  refreshConfig.ts       Hot-reload preferences at runtime (admin set-prefs)
  types.ts               Shared domain & config types
  generated/             Codegen output (do not hand-edit)
  components/
    actions/             Trigger→action runtime          → nested CLAUDE.md
    permissions/         Auth, JWT, RLS generation        → nested CLAUDE.md  (security-sensitive)
    database/            DB connection + query helpers (databaseConnect, postgresConnect)
    data_display/        Configurable read-only "data views" (docs: Data-View.md)
    files/               Upload/download, thumbnails, archive, cleanup, PDF generation
    external-apis/       Permission-gated proxy to external APIs (docs: External-API-Access.md)
    localisation/        Languages & translation strings (localisation/languages.json)
    preferences/         get/set server + web-app preferences
    snapshots/           Take/restore DB+files snapshots (docs: Snapshots.md)
    exportAndImport/     Encrypted full-system backups (docs: Backups.md)
    template-import-export/  Export/import/duplicate templates (docs: Template-Import-Export.md)
    fig-tree-evaluator/  Server wrapper for the fig-tree expression evaluator + fragments
    scheduler.ts         node-schedule jobs (cleanup, backup, archive, scheduled actions)
    other/               Grab-bag routes: raw-data, check-triggers, server-status websocket
  lookup-table/          Lookup/reference data tables + CSV import
database/                Schema SQL, migrations, snapshots CLI            → nested CLAUDE.md
plugins/                 Action plugins (standalone packages)             → nested CLAUDE.md
documentation/           Long-form dev docs (wiki source)
utils/                   Build scripts, codegen helpers, release, doc publishing
```

## Conventions

- **Prettier**: no semicolons, single quotes, 2-space indent, 100-col (`.prettierrc`). ESLint via `.eslintrc`.
- **Case**: Postgres columns are `snake_case`; TS is `camelCase`. PostGraphile + `pg-simplify-inflector` handle the boundary; helpers `objectKeysToCamelCase`/`objectKeysToSnakeCase` in [src/components/utilityFunctions.ts](src/components/utilityFunctions.ts) bridge raw queries.
- **Errors**: prefer `ApiError` / `returnApiError` ([src/ApiError.ts](src/ApiError.ts)). Always `return` the error reply — Fastify won't stop execution after `reply.send`, so a missing `return` causes double-send bugs.
- **Dev workflow**: branch off `develop` → PR back into `develop`. `main` only holds released features. Commit/push only when asked.

## Gotchas

- **PostGraphile is in-process** (not a separate `yarn pg` — see above). DB connection string is hard-coded in [src/postgraphile.ts](src/postgraphile.ts).
- **Admin JWTs bypass all RLS**: an `isAdmin` token carries `role: 'postgres'`, so it runs as superuser and ignores every policy. Treat `isAdmin` as full DB access. (See permissions guide.)
- **Action plugins are standalone npm packages** that must be compiled (`yarn build_plugins`); dev loads their `.ts` directly. See [plugins/CLAUDE.md](plugins/CLAUDE.md).
- **Preferences are runtime config**: edited via `/api/admin/set-prefs`, hot-reloaded by [src/refreshConfig.ts](src/refreshConfig.ts) (re-schedules jobs, updates locale/timezone). `PREFERENCE_OVERRIDES` env can point to a JSON file that deep-merges on top.
- **The public `/api/public/file` endpoint does not check permissions** (there's a `TO-DO` for it). Don't rely on it for access control on sensitive files.
- **`yarn generate` needs a running server** and overwrites `src/generated/graphql.ts`.
