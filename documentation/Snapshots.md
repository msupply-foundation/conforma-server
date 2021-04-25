# Snapshots

It's possible to create a 'snapshot' of current state of database `yarn take_snapshot` and load that snapshot via `yarn use_snapshot`, optional snapshot parameter can be specified `yarn take/use_snapshot {snapshot name}`, defaults to `current`

snapshots live in `database/snapshots/{snapshot name}` folder

in this doc the following terms are equivalent in the context of snapshots: `use`, `insert`, `import` and `take`, `export`

## Scripts

yarn `take/use_snapshot` uses `database/snapshotSripts/snapshot.js` which in turn calls `takeSnapshot.js` or `useSnapshot.js`. `snapshot.js` converts parameters to a config that's passed to relevant scripts, config is defined in `database/snapshotScripts/defaultConfig.js` (it's js not a json file because it's also used as a default in `takeSnapshot.js` which expects profile loaded inside the config)

## Parameters

run `yarn take_snapshot --help` to see parameters:

```
parameters: take|use|--help [--files] [--exclude-timestamps] [--profile <definition-name>] [<snapshot-name>]
default: <definition-file-name> = default
default: <snapshot-name>] = current
```

Snapshot name must be the last parameter if it's specified, profile name can be passed through (see `Profile` section below)

By default files (uploaded files) are not exported, --files flag can be used to export files (when snapshot with files folder is imported, it will overwrite existing files)

You may want to exclude timestamps (if it messes up your diff in tests etc..), they are needed by default to make sure application and review responses are sequenced correctly

## API

Exported methods from `takeSnapshot.js` and `useSnapshot.js` can be used independently, see their header definitions and `defaultConfig.js` for parameters they require.

## What is a Snapshot ?

Snapshot consists of a single file mutation `mutation.graphql`, optional file folder and `useSnapshotConfig`

Mutation will restore database (partially or as a whole, see `Profiles` below) to the state at which that snapshot was taken. This can of course can be done with `pg_dump` or by copying `pg_data` files, the advantages of single file GraphQL mutation (and the snapshot mechanism):

- It's easier to see the changes (especially when comparing diff of an operation)
- It's easier to make manual changes to the mutations in the snapshot
- Extra flexibility of table filtering via `profiles`
- Can be used in combination with core insert data scripts `databse/insertData/` to make changes to configuration while retaining test application data

`useSnapshotConfig` is extracted from profile (to be used when `use_snapshot` is invoked, see `Profiles` below)

## Temp snapshot

Snapshots with `temp` in their name are git ignored

## Snapshot diff

To see database changes between 'operations', take a snapshot and commit it to a new branch (or straight into working branch, make sure to delete the snasphot if you don't want it appearing in your PR), do the opearation, and diff should be visible

Can also take a `temp` snapshot, and compare in VS code (by selecting two snasphots in file list, then right click and `Compare Selected`)

## Profiles

Profiles are defined in `database/snapshotProfiles`, they can be used via `--profile {profile name}` (minus the .json)

The purpose of profile is to allow more granular control of snapshot export and import. Profiles should adhere to the following format:

```JSON
{
  "useSnapshotConfig" : {
    "initiliseDB": true/false, // do we need to initilise schmea before snapshot import (in most use cases would be true)
    "insertCoreData": true/false, // do we need to run core insertData scripts before snapshot import
    "ignoreInsertDataFiles": ["filename"] // this is optional, file names to ignore from database/insertData folder, more about this below
  }
  "definitions": [
    {
      "table": "tableName",
      "skip": true/false // default to false,
    }
  ]
}
```

Only tables in the definition list will be exported

**order is important** it's quite important that the mutations are placed inside the snapshot in correct order (in the same order that they appear in definitions file), to avoid constraint conflicts (i.e foreign key does not exists 'yet')

`insertCoreData` in combination with `ignoreInsertDataFiles` can be used to take and use snapshots of slices of data, for examples profile named `applicationData`, ignores templates and configuration and only exports application/review related data, `ignoreInsertDataFiles` includes files from `insertData` that deal with application/review data (these files are ignored, snapshot applications and review data will be used)

The reason behind storing use snapshot configuration with snapshot, was to allow custom profiles to be created (without commiting them), and for snapshot to carry the setting they need to be imported

## Insert data and snapshots ?

Snapshotting is not a replacement of existing `initialisation` and `insertion of data` (`yarn database_init`), but the plan is to only have `static` configuration in `insertData` (template, permissions). And use snapshots for things like applications state

Ideally `current snapshot` will be inline with snasphot created straight after `yarn database_init`

## How are Snapshots generated ?

- `profile` and GraphQL introspection query is used (introspection query is taken from `/graphiql`, check network in browser dev tools when that tool is loaded) to determine what tables were queried (and in which order). Promise.all resolved queries are executed to fetch data from DB, and subsequently turned to mutations:
- `generatedColumns` a query was added (via view) to GraphQL schema to identify generated columns, which will still be present in the snapshot mutation, but are commented out
- `files` are copied to files folder if specified (`--files`)
- `timestamp` data types can be ignored to reduce git diff (`--exclued-timestamps`)

Field list for query and mutation are extracted from introspection

See `takeSnapshot.js`.

## Sharing snapshots

The original intent for snapshot sharing was via `git` (just create test back end branch and commit to it, this is also a good way to see how operations change database, as you can clearly see changes as they are committed between subsequent snapshots, of the same name). Test branch can be shared during PR.

Another way is to zip the whole snapshot folder and share it, it would need to be extracted to `database/snapshot` folder before loading via `yarn use_snaphot {name of snapshot}`

## TODO

- Migration, when database schema is changed that may affect existing data, we would ideally want to create the following (so that older snapshots an be used, especially for unit testing)
  - Version the schema update and create sql commands for schema changes
  - Add migration of data for that particular version
  - Create a mechanims to apply the above tow for each version, if current DB instance is belows that version
  - This way snapshot can be loaded with the database version with which it was created, then migrations are executed to bring it up to speed with current DB schema
- Files
  - Extra things like `files` folder should be bundles with a snapshot
- Definitions
  - Have multiple definition sets with ability to choose which definitions set to use (i.e just application data, or just the actionQueue etc..)
- Show example of how snapshots can be used in unit tests
