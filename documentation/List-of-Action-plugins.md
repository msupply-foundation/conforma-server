## List of Action plugins created to-date:

### **Console Log**

- Just prints a message to the console. For demo purposes only.

| Required parameters | Output properties |
| ------------------- | ----------------- |
| `message`           |                   |

### **Create User**:

- Creates a new User in the database based on user input parameters.

| Required parameters | Output properties |
| ------------------- | ----------------- |
| `first_name`        | `userId`          |
| `last_name`         | `username`        |
| `username`          | `firstName`       |
| `date_of_birth`     | `lastName`        |
| `password_hash`     | `email`           |
| `email`             |                   |

### **Change Outcome**:

- Set the Outcome of an application to the input parameter ("Pending", "Approved", "Rejected")

| Required parameters | Output properties |
| ------------------- | ----------------- |
| `applicationId`     | `applicationId`   |
| `newOutcome`        | `newOutcome`      |

### **Increment Stage**:

- Changes the application Stage to the next in the sequence

  - Should be a default Action for all templates `onApplicationCreate`
  - If a new application, will create a corresponding Status set to "Draft"
  - If application is already on final stage, will leave unchanged

  | Required parameters | Output properties |
  | ------------------- | ----------------- |
  | `applicationId`     | `applicationId`   |
  |                     | `stageNumber`     |
  |                     | `stageName`       |
  |                     | `stageId`         |
  |                     | `status`          |
  |                     | `statusId`        |

### **Change Status**:

- Changes the application or review Status to the specifed input parameter

| Required parameters           | Output properties             |
| ----------------------------- | ----------------------------- |
| `applicationId` or `reviewId` | `applicationId` or `reviewId` |
| `newStatus`                   | `status`                      |
|                               | `statusId`                    |

Will determine to change status of review or application based on `applicationId` or `reviewId`
