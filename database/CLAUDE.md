# database/ — schema, migrations, snapshots

The Postgres schema is **the source of truth for the entire GraphQL API** — PostGraphile reflects tables/views into GraphQL, and the web-app's types are generated from it. Changing the schema here ripples through both repos. (Repo overview: [../CLAUDE.md](../CLAUDE.md).)

> The `documentation/Database-Schema-*.md` pages are good for *concepts* but stale on specifics. **These SQL files are authoritative** for the base schema — but note a few tables/columns (e.g. `evaluator_fragment`) are introduced only via `migration/migrateData.ts`, so check there too.

## Layout

```
database/
  buildSchema/            Numbered SQL files (01..46), run IN ORDER — the base schema definition
  create_schema.sql       Creates the empty `public` schema + the `graphile_user` role/grants
  initialise_database.sh   Fresh-install bootstrap (create schema, then build)
  migration/
    migrateData.ts        The migration runner (versioned blocks) — runs on every server start
    databaseMethods.ts    Helper methods used by migrations (e.g. changeSchema)
    types.ts
  snapshotCLI.ts          `yarn snapshot take|use` entry point
  insertData.ts / insert_data.sh   Seed/insert helpers
  core_templates/         Built-in templates loaded into fresh systems
  _snapshots/             Local snapshot store (git-ignored content)
```

Roughly: `01–04` foundation (JWT config, users, orgs), `05–25` templates/permissions/applications/actions, `26–39` reviews/files/notifications/activity log, `40–46` PostGraphile role, indexes, views/functions/triggers, and RLS.

## How the DB is set up

- **Dev**: `yarn database_init` (= `yarn snapshot use`) restores a snapshot — the usual way to get a working DB, not a raw schema build. With no name passed it uses the default; the repo ships a `core_templates` snapshot under `_snapshots/`. See the [README](../README.md) for first-time Postgres setup (`postgres` superuser, DB `tmf_app_manager`).
- **Fresh schema**: `initialise_database.sh` creates the database (if needed) and runs `create_schema.sql` (empty `public` schema + `graphile_user` role). It does **not** apply the `buildSchema/` files itself — tables/views/functions are materialised when a snapshot is restored and by `migrateData()` (which re-applies the `43`–`46` files).

## Migrations ([migration/migrateData.ts](migration/migrateData.ts))

- **Runs automatically on every server start** (first thing in `startServer`). It compares the DB version (`system_info` table) against the app version (`config`) using semver and runs only the blocks that apply.
- Add a migration as a guarded block, in version order:
  ```ts
  if (databaseVersionLessThan('2.1.0')) {
    console.log('Migrating to 2.1.0…')
    await DB.changeSchema(`ALTER TABLE … `)   // idempotent-ish; won't error if already applied
    // …data changes via DB.query(…)
  }
  ```
- **A schema change needs TWO edits**: update the relevant `buildSchema/NN_*.sql` file (so fresh installs are correct) **and** add a migration block in `migrateData.ts` (so existing DBs upgrade). They are not auto-derived from each other.
- `43_views_functions_triggers.sql` and `44_index.sql` are **fully re-applied at the end of every migration** (views/functions/triggers are recreated wholesale, not patched), as is the RLS step: `45_row_level_security.sql` normally, or `46_disable_row_level_security.sql` when `SKIP_RLS=true`. Put view/function/trigger changes in `43`.
- `yarn migrate` runs migrations to the current version without doing a release. Optional version arg simulates being on an older version for testing: `yarn migrate 2.0.5`.

## Snapshots ([snapshotCLI.ts](snapshotCLI.ts), `src/components/snapshots/`)

- A snapshot = a `pg_dump` of the DB + a copy of user files + prefs/localisation, in a timestamped folder. File **archives** are kept in a separate shared store and referenced by metadata (not duplicated per snapshot).
- `yarn snapshot use <name>` drops & recreates the schema, restores the dump, **then runs `migrateData()`** so older snapshots are upgraded to the current app version. Restoring a snapshot from a **newer** Conforma version is blocked.
- Used heavily for dev fixtures and for moving data between environments. (Docs: [../documentation/Snapshots.md](../documentation/Snapshots.md).)

## Schema → GraphQL types

- PostGraphile config: [../src/postgraphile.ts](../src/postgraphile.ts) (plugins: simplify-inflector, nested-mutations, connection-filter, TagsFilePlugin; `pgDefaultRole: 'graphile_user'`; watch mode on).
- **Smart tags**: [../postgraphile.tags.json5](../postgraphile.tags.json5) rewrites the GraphQL schema without changing the DB. Notably the real `user` table is renamed to `hiddenUser` and omitted (PII); `user_list` (id/name only) is exposed for public FK relationships; and the `user_list_admin` view is exposed in GraphQL **under the name `user`** (admin/RLS-protected, for internal queries). Add virtual FKs / renames / omits here.
- Regenerate types with `yarn generate` (server) **and** `yarn generate` in the web-app — both consume the live `localhost:8080/graphql`.

## Row-level security

- RLS is enabled per-table in `buildSchema/45_row_level_security.sql`. The actual *read* policies are **generated at runtime** from the permissions config by `updateRowPolicies()` (see [../src/components/permissions/CLAUDE.md](../src/components/permissions/CLAUDE.md)) and re-applied on startup and whenever policies change.
- Policies test `current_setting('jwt.claims.*')`. Admin tokens (`role: 'postgres'`) bypass RLS entirely.
- `SKIP_RLS=true` at startup applies `46_disable_row_level_security.sql` instead — useful for debugging, never for production.

## Key tables (high level)

`template` (+ `template_section`, `template_element`, `template_stage`, `template_stage_review_level`, `template_permission`, `template_action`) define a configurable workflow. `application` + `application_response` hold instances. `review_assignment` → `review` → `review_response` drive assessment. `permission_policy` / `permission_name` / `permission_join` express access. `data_table`/`data_view` back lookup data and configurable displays. `file`, `notification`, `activity_log`, `system_info`, `evaluator_fragment` support the rest. `user_session` holds login sessions (hashed refresh tokens) — server-side only: omitted from the GraphQL schema and RLS-enabled with no policies (though snapshots do still dump its rows).

## Gotchas

- **Two edits per schema change** (buildSchema SQL + migration) — see above.
- **Enums are painful in Postgres** (no `DROP VALUE`); changing one means rename→recreate→cast in a migration (search existing examples in `migrateData.ts`).
- **Don't hand-edit `src/generated/graphql.ts`** — it's regenerated.
- The DB connection string is hard-coded (`tmf_app_manager`) in `postgraphile.ts`.
