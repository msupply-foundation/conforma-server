## Contents

<!-- toc -->

- [Console Log](#console-log)
- [Change Outcome](#change-outcome)
- [Increment Stage](#increment-stage)
- [Change Status](#change-status)
- [Modify Record](#modify-record)
- [Generate Text String](#generate-text-string)
- [Join User to Organsation](#join-user-to-organsation)
- [Grant Permissions](#grant-permissions)
- [Generate Review Assignments](#generate-review-assignments)
- [Update Review Assignments](#update-review-assignments)
- [Trim Responses](#trim-responses)
- [Update Review Visibility](#update-review-visibility)
- [Update Review Statuses](#update-review-statuses)
- [Generate Document](#generate-document)
- [Send Notification](#send-notification)

* [Core Actions](#core-actions)

<!-- tocstop -->

---

### Console Log

Just prints a message to the console. For demo purposes only.

_Action Code:_ **`cLog`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `message`\*                              |                   |

---

### Change Outcome

Set the Outcome of an application to the input parameter ("Pending", "Approved", "Rejected")

- _Action Code:_ **`changeOutcome`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `applicationId`                          | `applicationId`   |
| `newOutcome`\*                           | `newOutcome`      |

**Note:** If `applicationId` is not provided, the plugin will attempt to retrieve it from `applicationData`.

---

### Increment Stage

Changes the application Stage to the next in the sequence

- _Action Code:_ **`incrementStage`**

  - If a new application, will create a corresponding Status set to "Draft"
  - If application is already on final stage, will leave unchanged
  - If application outcome is anything other than PENDING, will leave unchanged

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `applicationId`                          | `applicationId`   |
|                                          | `stageNumber`     |
|                                          | `stageName`       |
|                                          | `stageId`         |
|                                          | `status`          |
|                                          | `statusId`        |

**Note:** If `applicationId` is not provided, the plugin will attempt to fetch it from `applicationData`

---

### Change Status

- Changes the application or review Status to the specifed input parameter

- _Action Code:_ **`changeStatus`**

| Input parameters<br />(\*required) <br/> | Output properties             |
| ---------------------------------------- | ----------------------------- |
| `applicationId` or `reviewId`            | `applicationId` or `reviewId` |
| `newStatus` \*                           | `status`                      |
| `isReview`                               | `statusId`                    |

If we are wanting to change the status of a **review**, the parameter `isReview` should be set to `true`. If `applicationId` or `reviewId` are not provided, plugin will try to retrieve from `applicationData`.

**Note:**: If `isReview` is not provided, it default to `true` if the Action was triggered by a review. However, this means that if we want to set the status of an Application when a review is triggered, then we will need to explicitly set `isReview: false`.

---

### Modify Record

Creates or updates a database record on any table, and creates/updates a related JOIN table to associate the updated record with the application that caused it.

- _Action Code:_ **`modifyRecord`**

| Input parameters<br />(\*required) <br/> | Output properties    |
| ---------------------------------------- | -------------------- |
| `tableName`\*                            | `<tableName>` object |
| `matchField`                             |                      |
| `matchValue`                             |                      |
| `shouldCreateJoinTable` (default `true`) |                      |
| `...fields for database record`          |                      |

The Action first checks if a record exists, based on the `matchField` (e.g. `username`) and `matchValue` (e.g. the value of `username` to check). If it exists, the record will be updated, otherwise a new record is created.

If `matchField` is not provided, it will default to `id`.

If `matchValue` is not provided, it will use the value supplied with the record for that field. So you only really need to provide `matchValue` if you're changing the value of `matchField`

For example:

```
{
  tableName: 'user',
  matchField: 'username',
  username: 'js',
  email: 'john@msupply.foundation'
}
```

This will look for a user record with `username = "js"` and update it if found.

Wheras:

```
{
  tableName: 'user',
  matchField: 'username'
  matchValue: 'js',
  username: 'john',
  email: 'john@msupply.foundation'
}
```

This will look for a user record with `username = "js"` and update it with the _new_ username of `john`.

**Note:**

- fields with a value of `null` will be omitted from the database update, so any current values will remain unchanged.
- you can create/update an record without creating/updating the JOIN table by explicitly setting `shouldCreateJoinTable: false`

---

### Generate Text String

Generates serial numbers or arbitrary text strings (e.g. for application name) using a specified pattern, and updates a database record if requested.

- _Action Code:_ **`generateTextString`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `pattern`\*                              | `generatedText`   |
| `counterName`                            |                   |
| `counterInit`                            |                   |
| `customFields`                           |                   |
| `numberFormat`                           |                   |
| `fallbackText`                           |                   |
| `updateRecord` (default `false`)         |                   |
| `tableName`                              |                   |
| `fieldName`                              |                   |
| `matchField` (default `"id"`)            |                   |
| `matchValue` (default `applicationId`)   |                   |
| `additionalData`                         |                   |

This action achieves two things:

1. Generate strings based on pre-defined patterns, and;
2. (Optionally) update database records based on the generated string (e.g. update the application name on application submission)

It uses the [custom_string_patterns](https://www.npmjs.com/package/custom_string_patterns) package (which is, in turn, based on [randexp](https://www.npmjs.com/package/randexp)). It provides a shorthand for defining strings, which can include:

- random values based on regular expressions
- incrementing, persistent counters
- custom replacement functions
- object data replacement.

**A quick example:**

The pattern: `<?templateCode>-[A-Z]{3}-<+dddd>` consists of:

- `<?templateCode>` - will be replaced by the template code
- `[A-Z]{3}` a regular expression specifying 3 random upper-case characters in the A to Z range
- `<+dddd>` will be replaced with a four-digit number from a counter.

So for an "Organisation Registration" application, this pattern would result in a sequence of output strings like:  
`OrgRegistration-KUD-0100`  
`OrgRegistration-JNI-0101`  
`OrgRegistration-QLF-0102`

#### Parameters summary

The parameters can be considered in two distinct groups -- parameters for defining how to generate the string, and parameters for updating a database record.

##### String parameters

- `pattern`: defines the structure of the generated string. Please see the custom_string_patterns [documentation](https://www.npmjs.com/package/custom_string_patterns) for full detail, but the quick summary is:

  - regular expressions generate random strings that match the regex
  - `<+ddd>` inserts a number from a counter (see below for more detail about counters), with each `d` specifiying a digit (will be padded with leading 0's to fill the required length).
  - `<applicationData.username>` - this just specifies the name of a property to replace into the output string.

  - `<?field>` - the `?` specifies that this is a customReplacement function. A simplified version is used in this Action, so any `?` strings just represent a shorthand for a data field -- the mapping of these names to actual fields is specified in `customFields` (see below)

- `counterName`: if the pattern specifies a counter, this field specifies the name of the counter to use. There can be any number of different counters in the system -- they are stored in the `counter` database table with a unique name and current value. Each time a value is retrieved, the number is automatically incremented by 1.

- `counterInit`: if `counterName` doesn't already exist in the `counter` table, it will be created when first called, and its value will be set to the value specified in `counterInit` (or 1 if `counterInit` not set).

- `additionalData`: by default, `applicationData` and `outputCumulative` are passed to the string generator, so any fields on those objects (e.g. `applicationName`) are available, but other data can be made accessible with the `additionalData` field.

- `customFields`: as mentioned above, `customFields` just specifies a mapping from the replacement function (`<?xxxx>`) in the pattern to the exact property in the data objects available. So, in the example pattern above, we have `<?templateCode>`. The `customFields` parameter specifies where to find `templateCode`, like so:

  `customFields: { templateCode: applicationData.templateCode }`

  `customFields` are not necessary, they just provide a "shorthand" to write more concise string patterns. This pattern would result in the exact same thing:

  ```
  <applicationData.templateCode>-[A-Z]{3}-<+dddd>
  ```

  Note that this syntax doesn't required the `?` marker in the `< >`

- `fallbackText`: if the named property is not found in the supplied data, the replacement will instead be the value specified in `fallbackText`

##### Update record parameters

`updateRecord`: needs to be explicity set to `true` to update the database.

This action actually just calls [modifyRecord](#modify-record) to update the database, so the following parameters are the same as for in that action:

- `tableName`
- `fieldName`
- `matchField` (default `id`)
- `matchValue` (default `applicationId`)

##### More examples:

1.

```
{
  pattern: "S-[A-Z]{3}-<+dddd>"
  counterName: {
    operator: "objectProperties"
    children: [ "applicationData.templateCode" ]
  }
  counterInit: 100
  updateRecord: true
  tableName: "application"
  fieldName: "serial"
}
```

This generates serial numbers such as:  
`S-XLD-0100`  
`S-ZEH-0101`  
`S-DXF-0102`

It gets the number from a counter named from the `templateCode` via evaluator expression look-up, starts counting at 100, then saves the generated string to the `serial` field on the `application` table.

2.

```
{
    pattern: "<?templateName> - <?productName>",
    customFields: {
        templateName: "applicationData.templateName",
        productName: "applicationData.responses.Q20.text"
    }
    updateRecord: true
    tableName: "application"
    fieldName: "name"
}
```

This will update the application name with the template name and the product name, which we can see in this is extracted from `Q20` of the applicant's responses. As explained above, the pattern could just be expressed as `<applicationData.templateName> - <applicationData.responses.Q20.text>` with no `customFields`, but in this case it helps make clear what `Q20` actually holds (i.e. "product name")

The resulting application names would be things like:  
`Drug Registration - Paracetamol`  
`Drug Registration - Amphetamine`

---

### Join User to Organsation

Creates a link between a user and an organisation -- i.e. user is a "member" of that organisation. Adds a new record to the `user_organisation` table.

- _Action Code:_ **`joinUserOrg`**

| Input parameters<br />(\*required) <br/>    | Output properties |
| ------------------------------------------- | ----------------- |
| `user_id`\*                                 | `userOrgId`       |
| `org_id` \*                                 |                   |
| `user_role` (Arbitrary title, e.g. "Owner") |                   |

---

### Grant Permissions

Grants permission to user/org -- i.e. creates `permission_join` from user/org to permission name. If org not provided, the permission will be granted to the user only.

- _Action Code:_ **`grantPermission`**

| Input parameters<br />(\*required) <br/> | Output properties   |
| ---------------------------------------- | ------------------- |
| `username`\*                             | `permissionJoinIds` |
| `permissionNames`\* [Array of names]     | `permissionNames`   |
| `orgName`                                |                     |
| `orgId`                                  |                     |

---

### Generate Review Assignments

Generates records in the `review_assignment` table -- i.e. which users (reviewers) are allowed to do a review for the current stage/level (and for which Sections). The records are set with status "Available" or "Available for self-assignment", waiting for assignment.

It also creates records in the `review_assignment_assigner_join` table -- basically a list of users who have permission to make the _assignments_ in the review_assignment table.

Should be run whenever an application or review is submitted, and it will generate the review assignments for the next _review_ that should be done.

- _Action Code:_ **`generateReviewAssignments`**

| Input parameters<br />(\*required) <br/> | Output properties                 |
| ---------------------------------------- | --------------------------------- |
| `applicationId`                          | `reviewAssignmentIds`             |
| `reviewId`                               | `reviewAssignmentAssignerJoins`   |
| `isReview`                               | `reviewAssignmentAssignerJoinIds` |
|                                          | `currentReviewLevel`              |
|                                          | `nextReviewLevel`                 |

**Notes**:

- if `isReview` is NOT `true`, the Action will generate review assignment records for Stage 1, level 1 review. If `true`, it'll generate records for the _next_ review level (either in the same Stage or level 1 of the next Stage).
- if assignment records already exist (i.e. if it's a re-assignment), they will just be updated (with a new timestamp)

TO-DO:

- decide what to do with records that exist, but no longer should be (e.g. the reviewer has been removed/permissions revoked)\_
- allow optional parameter for `userId`: this will be for when we re-generate all review assignment records for a specific reviewer if (for example) they've had their permissions changed. When and how this occurs needs to be further thought out.

---

### Update Review Assignments

When a reviewer self-assigns themselves to a review_assignment (i.e. its status changes from "Available for self-assignment" to "Assigned") the other review assignment records pertaining to that review/stage/level are marked as "Self-assigned by another" so that no other reviewer can start a review for the same thing.

- _Action Code:_ **`updateReviewAssignmentsStatus`**

| Input parameters<br />(\*required) <br/>             | Output properties                                     |
| ---------------------------------------------------- | ----------------------------------------------------- |
| `reviewAssignmentId`\*                               | `reviewAssignmentUpdates` (`array` of `{id, status}`) |
| `trigger` (only executes on `ON_REVIEW_SELF_ASSIGN`) |                                                       |

**Note:** If `trigger` is not supplied, the plugin will try to infer it from `applicationData`

---

### Trim Responses

Whenever an application or review is submitted, this Action "cleans up", by deleting all responses that have not changed since the last submission (or are `null`). Also, the remaining responses have their timestamps (`timeUpdated`) updated to match the timestamp of the most recent status_history (application or review, as appropriate).

- _Action Code:_ **`trimResponses`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `applicationId` _OR_                     | `deletedIds`      |
| `reviewId`                               | `updatedIds`      |

---

### Update Review Visibility

Updates the applicant visibility of level 1 review responses based on the recommendations of the last-level review. I.e. it generate the "List of Questions" the applicant sees for making changes to their application.

- _Action Code:_ **`updateReviewVisibility`**

| Input parameters<br />(\*required) <br/> | Output properties                      |
| ---------------------------------------- | -------------------------------------- |
| `reviewId`                               | `reviewResponsesWithUpdatedVisibility` |

**Note:** If `reviewId` is not provided, the plugin will attempt to fetch it from `applicationData`

---

### Update Review Statuses

When an applicant re-submits an application after making changes, this Action updates the status of associated reviews to determine whether they should be "Pending" or "Locked" (or left as is)

- _Action Code:_ **`updateReviewsStatuses`**

| Input parameters<br />(\*required) <br/>                                        | Output properties |
| ------------------------------------------------------------------------------- | ----------------- |
| `applicationId`                                                                 | `updatedReviews`  |
| `reviewId`                                                                      |                   |
| `triggeredBy` Enum: REVIEW or APPLICATION (Default)                             |                   |
| `changedResponses`\* [Array of `applicationResponseIds` or `reviewReponsesIds`] |                   |

**Note:** - If `applicationId` or `reviewId` is not provided, the plugin will attempt to fetch it from `applicationData`. In case the `reviewId` is received, this Action will be updating status of related reviews of same stage in the current and next level reviews. Otherwhise (for an application submit - without passing `reviewId` this Action will be updating only reviewes of current level/stage.
The list of changed review/responses submitted is passed as `changedResponses` to the action and will define which reviews statuses to update by:

- For application submission all related reviews assigned to the same `templateIds` will have status updated to **PENDING**.
- For review submission to lower level reviewer (when review decision is **CHANGES_REQUEST**) all related reviews assigned to the same `templateIds` and that have a `reviewResponseDecision` as **DISAGREE** will have status updated to **PENDING**. Other reviews in same level will have status updated to **LOCKED**.
- For review submission to upper level reviewer (not **CHANGES_REQUEST** and not last-level review) all reviews with **SUBMITTED** status will be updated to **PENDING**.

---

### Generate Document

Generates a PDF file based on a [Carbone](https://carbone.io/api-reference.html) document template.

- _Action Code:_ **`generateDoc`**

| Input parameters<br />(\*required) <br/> | Output properties                          |
| ---------------------------------------- | ------------------------------------------ |
| `docTemplateId`\*                        | `document: {uniqueId, filename, filepath}` |
| `data`                                   |                                            |
| `additionalData`                         |                                            |
| `userId`                                 |                                            |
| `applicationSerial`                      |                                            |

The Action utilises the internal `generatePDF` function, which is also accessible via the [`/generate-pdf` endpoint](API.md)

`docTemplateId` specifies the uniqueId of the carbone template file (from the "file" table)

`data` is the object that contains all the data for substituting values into the carbone template. You can specifify a `data` object explicitly, or by default it will use properties `applicationData` and `outputCumulative`. If you want to _add_ to these, you can provide an `additionalData` parameter object which will be added as an additional field, like so:

```
data: { ...applicationData, ...outputCumulative, additionalData }
```

`userId` and `applicationSerial` are not required for functioning, but will be stored as fields in the resulting "file" record. If `applicationSerial` is supplied, the output PDF file will be stored in a subfolder named for the application serial.

The output object `document` provides the `uniqueId`, `filename`, and `filepath` (relative to server root) of the generated document, so it can be accessed by subsequent actions

---

### Send Notification

Generates notifications and sends email. For now, there is no UI for notifications in the app, so emails are the primary means of notifying users. A notification record is stored in the database though ("notification" table).

- _Action Code:_ **`sendNotification`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `subject`\*                              | `notification`    |
| `message`\*                              |                   |
| `email`                                  |                   |
| `userId`                                 |                   |
| `fromName`                               |                   |
| `fromEmail`                              |                   |
| `attachments`                            |                   |
| `sendEmail`                              |                   |

This action requires the use of an external SMTP server for sending the emails. You'll need to provide configuration details for this in the `config.json` file within this actions folder. The SMTP password needs to be stored seperately in the system's (non-shared) `.env` or passed in as an argument at runtime (when running on production server). When storing it in .env, use this format:

```
SMTP_PASSWORD=<password>
```

`subject` and `message` are just the email subject line and message

`email` -- the email address(es) to send the email to. Can be a string (single email address) or an array of strings if multiple recipients. If not supplied, will use the "email" field from `applicationData`.

`userId` for the notification recipient. If not supplied, it will be taken from `applicationData`.

`fromName` / `fromEmail` refer to who the apparent sender of the email is. Default value(s) should be supplied in `config.json`, but can be over-ridden on a case-by-case basis.

`sendEmail` -- if `true` (this is default), an email will be sent, otherwise a notification record will be created with no email sent.

`attachments` -- any files to attach with the email. Files should already be in the system and have an associated uniqueId. This parameter should be either a single string with the uniqueId, or an array of uniqueId strings if there is more than one attachment. (It is possible to send external files by using a url, but this is not fully reliable as yet -- please see the "prepareAttachments" comment in `sendNotification.ts` if you'd like to try that.)

The output object `notification` contains all the fields from the notification record:

`id, user_id, application_id, review_id, email_recipients, subject, message, attachments, email_sent, is_read`

---

## Core Actions

There are certain Actions that _must_ run on particular events to facilitate a standard application/review workflow process. We have called these **Core Actions**, and they have been collected in a single "core_mutations.js" file (for insertion into database via GraphQL). Each template (other than "User Registration") has this block slugged into it as a template literal (`${coreActions}`) in its Action insertion block, before any Actions that are specific to that template.

Here is a summary of the core actions and the triggers that launch them:

#### On Application Create:

- Increment Stage (sets to Stage 1, also sets Status to "Draft")

#### On Application Submit

- Change Status (to "Submitted")
- Trim Responses (removes Null responses and unchanged ones if re-submission)
- Generate Review Assignments (for first level reviewers)
- Update Reviews (statuses)

#### On Application Restart (i.e. after "Changes Requested"):

- Change Status (back to "Draft")

#### On Review Self-Assign:

- Update Review Assignment Status (for other reviewers)

#### On Review Assign (by other)

- Nothing yet (To-do?)

#### On Review Create

- Change Status (to "Draft")

#### On Review Submit:

- Change Status (to "Submitted")
- Trim Responses
- Update Review Statuses (for other reviews related to this review submission)
- Increment Stage (if last level reviewer approves)
- Generate Review Assignments (for next level review)
- Update review response visibility (for applicant)
- Change Status (Application, conditional on the review decision)

#### On Review Restart: (i.e. review making changes based on higher level requests)

- Change Status (review status to "Draft")
