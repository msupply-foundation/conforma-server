System preferences for a given system are stored in `/preferences/preferences.json` and are exported and imported as part of a system [snapshot](Snapshots.md)

They are divided into **web** and **server** blocks, which refer to the web app (front-end) and server respectively.

The available properties are as follows (almost  are optional, as the system has fallback defaults for most of them, specified below):

### Server
- `thumbnailMaxWidth`: the maximum width (in pixels) of thumbnails that are generated for images uploaded with the [File Upload](API.md/#file-upload-endpoint) endpoint. (Default `300`)
- **`thumbnailMaxHeight`**: Same as `thumbnailMaxWidth`, but for thumbnail height.
- **`hoursSchedule`**: A schedule for how often scheduled actions should run, expressed in [node-schedule](https://www.npmjs.com/package/node-schedule) "hours" format (an array of numbers between 0 and 23, representing the hours at which the should should run). (Default: every hour)
- **`SMTPConfig`**: Configuration options for sending emails from the system using the [sendNotification action](List-of-Action-plugins.md/#send-notification), with the following properties:  
  ```ts
  {
    host: string
    port: number
    secure: boolean
    user: string
    defaultFromName: string // Can be over-ridden for specific actions
    defaultFromEmail: string // Can be over-ridden for specific actions
  }
  ```
  The default is no configuration -- no emails will be sent.  
  Note: the **password** is not stored here, for security reasons. It must be passed in to the server as and environment variable: `SMTP_PASSWORD`. This should be in an `.env` file for development, or as part of the server start-up command for a live server.
- **`systemManagerPermissionName`**: The "system manager" is a special permission that has certain system management rights (but not as extensive as "Admin"). Any existing permission name can be used for this special permission, in which case it should be specified here. (Default: `systemManager`)
- **`previewDocsMinKeepTime`**: Documents generated as part of the Preview functionality will be periodically cleaned up, as they have no lasting use. It should be a Postgres duration string. The default is "2 hours".
- **`previewDocsCleanupSchedule`**: The schedule for cleaning up (deleting) the preview documents, in node-schedule "hours" format, as above. (Default: once per day at 1 am)
- **`backupSchedule`**: How often system backups should run, as per the node-schedule "hours" schedule above. (Default: once per day at 1 am)
- **`backupFilePrefix`**: System backups are saved with the name format `backupFilePrefix_date_time.zip`, e.g. `conforma_backup_2023-04-04_01-00-00.zip`. (Default: "conforma_backup")
- **`maxBackupDurationDays`**: Backups are kept for this many days, after which they're deleted next time the backup schedule runs. The default is nothing -- all backups will be kept.
- **`testingEmail`**: During development and on a testing server, we don't want emails being sent to real people. If this property is set, and the site is not running on the designated host (as defined in `siteHost` below), then all emails will be send to this address instead. (If no `testingEmail` is specified, no emails will be sent at all)

### Web app

- **`paginationPresets`**: An array of integers representing options for the "number per page" dropdown on tables (Application list, Data views). (Default: `[2, 5, 10, 20, 50]`)
- **`paginationDefault`**: How many records to show in a table by default. (Default: `20`)
- **`defaultLanguageCode`**: If no language has been selected by the user yet, the system will default to this language. Must correspond to the `code` value specified in one of the active languages (in `localisation`) (No default, as we can't guarantee that any particular language will be active)
- **`brandLogoFileId`**: To override the default Conforma logo on the Login page, specify the database fileId of the image file.
- **`brandLogoOnDarkFileId`**: The same as above, but for the logo shown on the main header of the app.
- **`defaultListFilters`**: In the Application List, these filter options will be initially enabled (though with no values selected). (Default: `['applicantDeadline', 'reviewers', 'reviewerAction', 'stage' ]`)
- **`style`**: A limited range of CSS overrides. Currently only `headerBgColor` is supported (which changes the color of the app's main header)
- **`siteHost`**: The canonical host domain that the live version of the site will be served from. This is how the system can determine if it is a "live" or "testing" site -- by comparing this value against the current url. If not specified, the system will be treated like a "live" system regardless of where it's actually running.
- **`googleAnalyticsId`**: The web app has support for Google Analytics tracking. If you want to use it, enter your Analytics ID here. Note: this requires `siteHost` to be set correctly -- analytics will only work when the browser URL matches this value (so we don't enable tracking on test or dev systems).