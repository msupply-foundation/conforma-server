## List of Action plugins created to-date:

### **Console Log**

Just prints a message to the console. For demo purposes only.

_Action Code:_ **`cLog`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `message`\*                              |                   |

### **Create User**:

Creates a new User in the database based on user input parameters.

- _Action Code:_ **`cLog`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `first_name`\*                           | `userId`          |
| `last_name`                              | `username`        |
| `username`\*                             | `firstName`       |
| `date_of_birth`                          | `lastName`        |
| `password_hash`\*                        | `email`           |
| `email`\*                                |                   |

### **Change Outcome**:

Set the Outcome of an application to the input parameter ("Pending", "Approved", "Rejected")

- _Action Code:_ **`changeOutcome`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `applicationId`\*                        | `applicationId`   |
| `newOutcome`\*                           | `newOutcome`      |

**To-do**:

- update to take either applicationId or applicationSerial input
- update to use applicationData for application input if not provided
- output also include serial

### **Increment Stage**:

Changes the application Stage to the next in the sequence

- _Action Code:_ **`incrementStage`**

  - If a new application, will create a corresponding Status set to "Draft"
  - If application is already on final stage, will leave unchanged

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `applicationId`\*                        | `applicationId`   |
|                                          | `stageNumber`     |
|                                          | `stageName`       |
|                                          | `stageId`         |
|                                          | `status`          |
|                                          | `statusId`        |

**To-do**:

- update to take either applicationId or applicationSerial
- update to use applicationData for application input if not provided
- output also include serial

### **Change Status**:

- Changes the application or review Status to the specifed input parameter

| Input parameters<br />(\*required) <br/> | Output properties             |
| ---------------------------------------- | ----------------------------- |
| `applicationId` or `reviewId`            | `applicationId` or `reviewId` |
| `newStatus` \*                           | `status`                      |
|                                          | `statusId`                    |

Will determine to change status of review or application based on `applicationId` or `reviewId`

**To-do**:

- update to take either applicationId or applicationSerial
- update to use applicationData for application input if not provided
- output also include serial
- also update Status of associated application/review respones (on Submission)

### **Create Organisation**

Creates a new Organisation in the database based on user input parameters.

- _Action Code:_ **`createOrg`**

| Input parameters<br />(\*required) <br/> | Output properties |
| ---------------------------------------- | ----------------- |
| `name`\*                                 | `orgId`           |
| `licence_number`                         | `orgName`         |
| `address`                                |                   |

### Join User to Organsation

Creates a link between a user and an organisation -- i.e. user is a "member" of that organisation. Adds a new record to the `user_organisation` table.

- _Action Code:_ **`joinUserOrg`**

| Input parameters<br />(\*required) <br/>    | Output properties |
| ------------------------------------------- | ----------------- |
| `user_id`\*                                 | `userOrgId`       |
| `org_id` \*                                 |                   |
| `user_role` (Arbitrary title, e.g. "Owner") |                   |

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
| `applicationId`\*                        | `reviewAssignmentIds`             |
| `reviewId`                               | `reviewAssignmentAssignerJoins`   |
| `templateId`\*                           | `reviewAssignmentAssignerJoinIds` |
| `stageId`\*                              | `currentReviewLevel`              |
| `stageNumber`\*                          | `nextReviewLevel`                 |

Note: if a `reviewId` is supplied, the Action will generate review assignments for that _review_. If not, they will be generated for the _application_ (i.e. level 1)

---

### Core Actions

-- TO DOCUMENT...
