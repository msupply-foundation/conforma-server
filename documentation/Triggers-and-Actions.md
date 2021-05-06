# Triggers & Actions

<!-- toc -->

## Article Contents

- [Overview of Trigger and Action system](#overview-of-trigger-and-action-system)
- [List of available Triggers and the "listener" associated with it.](#list-of-available-triggers-and-the-listener-associated-with-it)
- [Actions](#actions)
- [Action parameters](#action-parameters)
- [Passing information to Actions](#passing-information-to-actions)

<!-- tocstop -->

In order to facilitate customisable events in Application Templates, there is a system of **Triggers** associated with various events that, in turn, trigger **Actions** -- "things that happen" in response to a trigger.

An Application Template will specify:

- Set of Triggers
- Action(s) that happen in response to each trigger
- Conditions (using [dynamic expression syntax](Query-Syntax.md)) under which the Action will run
- And parameters (again, as dynamic expressions) that will be sent to the Action at runtime

Most triggers are associated with events on the main database tables (Application, Review, etc.). Specifically, there is a field on these tables called `trigger` into which the "event" (e.g. "On Application Submit") is recorded. The database listens to this field, then notifies the server, which launches the appropriate Actions, using parameters from the current conditions.

Actions can be defined as **Sequential** or **Async** (parallel). Async Actions are executed as soon as the server is notified that they are in the Action queue, whereas Sequential Actions have an additional `sequence` property, and are processed in the prescribed sequence once they've all been inserted into the Action queue.

Actions also return an **output** object (e.g. `createUser` Action returns user details). For sequential Actions, the output properties are collected into a `cumulativeOutput` object which is passed to the parameter evaluator (along with the **application_data\*** object -- see "Action Parameters" below), so subsequent Actions can access any of the output properties of any previous Action in the sequence.

## Overview of Trigger and Action system

![](images/triggers-and-actions-diagram.png)

## List of available Triggers and the "listener" associated with it.

| Trigger Name               | Listener                                                         |
| -------------------------- | ---------------------------------------------------------------- |
| `ON_APPLICATION_CREATE`    | Postgres trigger on `Application` table                          |
| `ON_APPLICATION_SUBMIT`    | Postgres trigger on `Application` table                          |
| `ON_APPLICATION_SAVE`      | Postgres trigger on `Application` table                          |
| `ON_APPLICATION_WITHDRAWn` | Postgres trigger on `Application` table                          |
| `ON_REVIEW_CREATE`         | Postgres trigger on `Review` table                               |
| `ON_REVIEW_START`          | Postgres trigger on `Review` table                               |
| `ON_REVIEW_SUBMIT`         | Postgres trigger on `Review` table                               |
| `ON_REVIEW_ASSIGN`         | To be decided                                                    |
| `ON_APPROVAL_SUBMIT`       | To be decided                                                    |
| `onScheduledTime`          | Server scheduled service (see [here](link to Scheduled actions)) |

## Actions

Actions are implemented as **plug-ins** -- standalone packages that can be created and customised outisde the main application. As far as the Server is concerned, an Action plug-in is basically an imported **function**, with a defined set of expected parameters.

See the [list of Action plugins](List-of-Action-plugins.md) for currently available Action plugins.

## Action parameters

Actions associated with templates (in **action_template** table) have two fields that can store [dynamic expressions](Query-Syntax.md) which are evaluated at runtime. These are:

- **condition**: an expression which must evaluate to a boolean. If `true` at runtime, the Action will run. An example usage could be to check the current status of the application and only run if it matches a certain value.
- **parameter_queries**: Every Action plugin has prescribed required parameters (see [Action plugin specification](Action-plugin-specification.md)). In the parameter_queries field, every required parameter has an expression associated which is used to generate the parameter value at runtime. See the [list of Action plugins](List-of-Action-plugins.md) for each plugin's required parameters

## Passing information to Actions

The expressions which are defined in the above fields will often need access to information about the current application state or current user details (for example). While this information can always be extracted from the database (using the `pgSQL` or `graphQL` operators), it will normally be faster and simpler to pass this information in directly.

There are two local state objects passed into the expression evaluator (which can be accessed using the `objectProperties` operator) when processing Triggers/Actions:

- **applicationData**: A collection of useful application state information that is fetched during trigger processing. The (current) fields provided are:

See the interface "ActionApplicationData" in `./src/types.ts` for all the properties available in `applicationData`.

- **outputCumulative**: When sequential Actions run, the output from each one is collected into this combined object and passed to subsequent Actions in the sequence. So the final Action in a sequence will have access to the output properties from _all_ previous Actions.

All plugins expect an input object of the following shape:

```
{
  parameters: <required and optional parameters>,
  applicationData: ..,
  outputCumulative:...,
  DBConnect:...,
}
```

Note that `applicationData` is regenerated between each Action in a sequence, so each plugin will have access to up-to-date data (even though it may have changed as a result of previous sequential Actions).

**Examples:**

1. If you want a certain Action to only run when the current application status is "Draft", the `condition` expression would be:

```
{
  operator: "=",
  children: [
    {
      operator: "objectProperties",
      children: ["applicationData.status"]
    },
    "Draft"
  ]
}
```

2. For the "Change Status" plugin, the required parameters are `applicationId` and `newStatus`. To change the triggered application to status "Submitted", the `parameter_queries` expression would be:

```
{
  applicationId: {
    operator: "objectProperties",
    children: ["applicationData.applicationId"] },
  newStatus: "Submitted"
}
```

3. A sequential "Console Logger" Action, which follows after "Create User" and "Change Outcome", needs to print a message about newly-created User to the console. It's `parameter_queries` expression could be:

```
{
    message: {
      operator: "CONCAT"
      children: [
        "Output concatenation: The user ",
        {
          operator: "objectProperties",
          children: [ "currentUser.username" ]
        },
        "'s registration has been ",
        {
          operator: "objectProperties",
          children: [ "applicationData.outcome" ]
        }
      ]
    }
}
```
