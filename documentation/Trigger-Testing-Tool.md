When configuring an application, it's important to test all the actions with a variety of conditions/inputs and make sure the output is correct. However, going through an entire application from creation to final review can be time-consuming and tedious.

So we've created a simple development tool that can be used to easily test triggers/actions. It's called by requests to a [server endpoint](API.md):

```
/admin/test-trigger
```

Parameters are provided as body JSON.

In a nutshell, you specify a template type (by code) and a trigger, and when called the server will execute that trigger on an application of that type, and return the output information and any errors.

The JSON body syntax is basically:
```
{
    "templateCode": <code>,
    "trigger": <triggerName / alias>,
    <options...>
}
```

You can test the whole lifecycle of an application by running the triggers through in order, e.g. "create", "submit", "assign", "reviewStart", "reviewSubmit".

Here is the list of triggers with their available aliases (case insensitive):

| Trigger                  | Aliases                              |
| ------------------------ | ------------------------------------ |
| `ON_APPLICATION_CREATE`  | `"create"`<br/>`"start"`             |
| `ON_APPLICATION_SUBMIT`  | `"submit"`                           |
| `ON_APPLICATION_RESTART` | `"restart"`                          |
| `ON_REVIEW_ASSIGN`       | `"assign"`                           |
| `ON_REVIEW_UNASSIGN`     | `"unassign"`                         |
| `ON_REVIEW_CREATE`       | `"reviewCreate"`<br/>`"reviewStart"` |
| `ON_REVIEW_RESTART`      | `"reviewRestart"`                    |
| `ON_REVIEW_SUBMIT`       | `"reviewSubmit"`                     |
| `ON_EXTEND`              | `"extend"`                           |
| `ON_SCHEDULE`            | `"schedule"`                         |
| `ON_PREVIEW`             | `"preview"`                          |
| `ON_VERIFICATION`        | `"verify"`<br/>`"verify"`            |
| `DEV_TEST`               | `"devtest"`                          |
| `RESET`<sup>*</sup>      | `"reset"`                            |

<sup>*</sup> "RESET" is not a real trigger, but it can be used here to reset the testing application back to its initial state (i.e. unsubmitted, no reviews, etc.).

Note that the application must be in a valid state for a trigger to work, e.g. you can't run a "reviewStart" trigger on an application that hasn't yet been assigned.

For the most part, you don't need any additional parameters for the triggers as they will run with sensible defaults. However, if you wish to deviate from the default (e.g. submit a review with a decision other than "APPROVE"), these can be specified as follows:

### ON_REVIEW_ASSIGN

With no additional parameters, the application will assign all sections to a random reviewer (who has the appropriate permissions).

**Available parameters**:

- `assignmentId`: the id of a particular "review_assignment" record
- `sectionCodes`: an array of section codes to assign, e.g. `["S1", "S2"]`

### ON_REVIEW_CREATE

By default, a review will be started for the highest stage/level that is currently assigned (and pick one at random if there are more than one, e.g. sections divided between multiple reviewers).

**Available parameters**:

- `assignmentId`: the id of a particular "review_assignment" record (must have been assigned)

### ON_REVIEW_SUBMIT

By default, the review will be submitted with the decision "CONFORM", and comment "No comment". If multiple reviews are in progress, one will be selected at random.

**Available parameters**:

- `reviewId`: the id of a particular "review" record
- `decision`: Either "CONFORM", "NON_CONFORM", "LIST_OF_QUESTIONS" (for application reviews), or "CHANGES_REQUESTED" (for consolidations/reviews of reviews)

### ON_REVIEW_RESTART

By default, the review will be re-started for the highest stage/level review that can be restarted (and pick one at random if there are more than one).

**Available parameters**:

- `reviewId`: the id of a particular "review" record

### ON_PREVIEW

Because this trigger is for previewing before submitting a review, it follows the same rules/parameters as `ON__REVIEW_SUBMIT`

### ON_SCHEDULE

**Required parameters**:

- `eventCode`: the code of the action to run as a result of the scheduled event. See [Scheduled Actions](List-of-Action-plugins.md#schedule-action) for more info about how scheduled actions work.


## Example

Here is an example for one testing pathway for a "Company Registration" template.

```
{
    "templateCode": "U2-OrgRegistration",
    "trigger": "create"
}

// returns action output, updates "config" application

{
    "templateCode": "U2-OrgRegistration",
    "trigger": "submit"
}

// Submits application, generates review assignments

{
    "templateCode": "U2-OrgRegistration",
    "trigger": "assign"
}

// Assigns a random reviewer to review, triggers their review assignment record

{
    "templateCode": "U2-OrgRegistration",
    "trigger": "reviewCreate"
}

// Creates review (and decision) for assigned reviewer, runs trigger for that new review record

{
    "templateCode": "U2-OrgRegistration",
    "trigger": "preview"
}

// Preview review decision "CONFORM" (decision not explicitly required  as "CONFORM" is default)

{
    "templateCode": "U2-OrgRegistration",
    "trigger": "reviewSubmit",
     "decision": "LIST_OF_QUESTIONS"
}

// Submits review with "LIST_OF_QUESTIONS" decision, runs trigger accordingly

etc...
```

## Other parameters

As with all actions, [`applicationData`](Triggers-and-Actions.md#passing-information-to-actions) is passed to the action process.

With this tool, *any* properties of application data (even deeply nested ones) can be overridden with the `applicationDataOverride` parameter. Custom values will be merged with the real `applicationData` in the same way they do with the [Preview/Alias action](List-of-Action-plugins.md#aliasing-existing-template-actions). So you can simulate any particular application state in addition to the "shortcut" parameters defined for each trigger above.

This means you can simulate most application states without having to go through all the stages/levels. For example, you can set the "Outcome" to "APPROVED" when testing "reviewSubmit" and it will run the modifyRecord and generateDoc actions as though the application had been approved. (You can do something similar with the "decision" parameter, but if you have a multi-stage review, the Outcome won't be changed until the very last stage/level, so this allows you to "fast-track" that state without having to progress the application through all stages/levels. ).

As a shorthand the following parameters can be provided directly in the top-level parameters (they'll be inserted into `applicationDataOverride` for you):

- stageNumber
- status
- outcome