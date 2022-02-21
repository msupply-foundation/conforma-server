# Data Migration

When upgrading to a new version of **Conforma** we may need to modify the existing database if the database schema has changed, or we've changed what data is stored in what fields.

We need to account for both the following scenarios:

1. Upgrading an existing server and migrate the data in place without taking a snapshot
2. Loaded snapshots might require data migration before they can work correctly
3. In development, we may need to update our dev data to work with code we're writing, even though the version number hasn't been increased yet.

This process is handled by the "migrateData.ts" script, which runs automatically every time the server (re-)starts, or it can be run manually in the dev environment.

## 1. Upgrading an existing server in place

After [upgrading the server](Demo-Server-Guide.md), when the server restarts, the migration process is automatic. The script checks the version of the app saved in the database, compares it against the current (new) version number, and acts accordingly. If the saved version matches the current version, nothing happens. Each migration block has a version number check on it, and will run if the database version is less than this version number. So even when upgrading a server by several versions at once, the migration script will run in sequence for every previous version that has been skipped over.

For live servers, data migration after an upgrade should be an invisible process.

## 2. Migrating data with snapshots

From v0.2.0 onwards, whenever a [snapshot](Snapshots.md) is saved, a full database schema build script will be exported with the snapshot (`schema_init.sql`). Then, when the snapshot is loaded this saved script will be run to initialise the database. This ensures that the database schema will be restored to how it was when the snapshot was saved, to avoid any possible insertion errors due to schema incompatibility. 

Once the snapshot insertion is complete, the migrateData script is called, which will then modify the database to bring it into line with the current app version.

(If no `schema_init` file is found when loading a snapshot (i.e. for older snapshots), then the current "buildSchema" scripts will be run.)

## 3. Migrating data in development environment

When we change the schema as part of the development process, we should also write the appropriate migration code into `migrateData.ts`. However, the migration code won't run automatically on server (re-)start, since the app version hasn't been increated yet. 

We can manually run the migration script using the following command:
```
yarn migrate [version]
```

As long as the new migration code has a version check higher than the current version, the script will run the new migration code. 

If we wish to manually migrate from data that was created in a lower version than we're currently working, we can supply the optional `<version>` argument and the script will run as though that were the saved database version.

An advantage of having to run the migration script manually during development is that partially-written migration code won't be executed when we don't want it to when saving changes that cause a server restart. And when the data *has* been migrated, the script won't attempt to run the migration again when the server restarts. (Although, for the most part there shouldn't be any negative effects from running the migration script repeatedly.)

## Guidelines for modifying `migrateData.ts`

- Each version's migration code should follow linearly after the last. Look for the comment `// Other version migrations continue here...` for where to insert the next migration.
- Database queries should be added to the "databaseMethods.ts" file and called from the main script.
- For SQL statements that are just schema changes (i.e. they don't modify data), use the database method `changeSchema()`, and write the raw query as the function argument (see migrateData.ts for examples. The difference between this and other database methods is that this one *won't* throw an error on failure, as it's assumed that the error will be due to trying to modify something that already exists (i.e. you've already run the migration script).
- Each migration block should be wrapped in an `if (databaseVersionLessThan(<version>))` block. For example:
  ```
  if (databaseVersionLessThan('0.2.0')) {
    // Do migration stuff here //
  }
  ```
- When writing new migration code, we will need to make an assumption about the next version number. However, any change that requires migration code will be a non-backwards-compatible change, so should be considered at least a [minor upgrade](https://semver.org/) (the middle number of the three).