## Contents

<!-- toc -->

- [Console Log](#console-log)
- [Change Outcome](#change-outcome)
- [Increment Stage](#increment-stage)
- [Change Status](#change-status)
- [Modify Record](#modify-record)
- [Join User to Organsation](#join-user-to-organsation)
- [Grant Permissions](#grant-permissions)
- [Generate Review Assignments](#generate-review-assignments)
- [Update Review Assignments](#update-review-assignments)
- [Trim Responses](#trim-responses)
- [Update Review Visibility](#update-review-visibility)
- [Update Review Statuses](#update-review-statuses)

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

Creates or updates a database record on any table. Currently used for creating updating/users and organisations.

- _Action Code:_ **`modifyRecord`**

| Input parameters<br />(\*required) <br/> | Output properties    |
| ---------------------------------------- | -------------------- |
| `tableName`\*                            | `<tableName>` object |
| `matchField`                             |                      |
| `matchValue`                             |                      |
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
| `orgName`                                | `permissionNames`   |
| `permissionNames`\* [Array of names]     |                     |

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

| Input parameters<br />(\*required) <br/>                        | Output properties |
| --------------------------------------------------------------- | ----------------- |
| `applicationId`                                                 | `updatedReviews`  |
| `changedApplicationResponses` [Array of applicationResponseIds] |                   |

**Note:** If `applicationId` is not provided, the plugin will attempt to fetch it from `applicationData`

---

## Core Actions

There are certain Actions that _must_ run on particular events to facilitate a standard application/review workflow process. We have called these **Core Actions**, and they have been collected in a single "core_actions.js" file (for insertion into database via GraphQL). Each template (other than "User Registration") has this block slugged into it as a template literal (`${coreActions}`) in its Action insertion block, before any Actions that are specific to that template.

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
- Generate Review Assignments (for next level review)
- Update review response visibility (for applicant)
- Change Status (Application, conditional on the review decision)
- Increment Stage (if last level reviewer approves)

#### On Review Restart: (i.e. review making changes based on higher level requests)

- Change Status (review status to "Draft")
