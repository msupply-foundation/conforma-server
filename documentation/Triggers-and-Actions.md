# Triggers & Actions

In order to facilitate customisable events in Application Templates, there is a system of **Triggers** associated with various events that, in turn, trigger **Actions** -- "things that happen" in response to a trigger. 

An Application Template will specify:
- Set of Triggers
- Action(s) that happen in response to each trigger
- Conditions (using [dynamic expression syntax](Query-Syntax.md)) under which the Action will run
- And parameters (again, as dynamic expressions) that will be sent to the Action at runtime

Most triggers are associated with events on the main database tables (Application, Review, etc.). Specifically, there is a field on these tables called `trigger` into which the "event" (e.g. "On Application Submit") is recorded. The database listens to this field, then notifies the server, which launches the appropriate Actions, using parameters from the current conditions.

### Overview of Trigger and Action system

![](images/triggers-and-actions-diagram.png)

### List of available Triggers and the "listener" associated with it.

| Trigger Name             | Listener                                                         |
| ------------------------ | ---------------------------------------------------------------- |
| `onApplicationCreate`    | Postgres trigger on `Application` table                          |
| `onApplicationSubmit`    | Postgres trigger on `Application` table                          |
| `onApplicationSave`      | Postgres trigger on `Application` table                          |
| `onApplicationWithdrawn` | Postgres trigger on `Review` table                               |
| `onReviewStart`          | Postgres trigger on `Review` table                               |
| `onReviewSubmit`         | Postgres trigger on `Review` table                               |
| `onEditComment`          | Postgres trigger on `Review_response` table                      |
| `onReviewSave`           | Postgres trigger on `Review` table                               |
| `onApplicationAssign`    | Postgres trigger on `Review_section_assign` table                |
| `onApprovalSubmit`       | Postgres trigger on `Review_section` table                       |
| `onScheduledTime`        | Server scheduled service (see [here](link to Scheduled actions)) |

### Actions

Actions are implemented as **plug-ins** -- standalone packages that can be created and customised outisde the main application. As far as the Server is concerned, an Action plug-in is basically an imported **function**, with a defined set of expected parameters.

Here is a list of Actions which are anticipated to be part of the core system: (work in progress):

| Action Name              | Required Parameters                                                                                                                                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `sendNotification`       | <ul> <li>user/org (string)</li> <li>Recipient (user/org id)</li> <li>Subject (string)</li> <li>Message (int/string) (reference to predefined messages)</li> <li>Attachments (file paths)</li> </ul>                                                                                                             |
| `changeStatus`           | <ul> <li>Application_id</li> <li>New status (string)</li> </ul>                                                                                                                                                                                                                      |
| `changeStage`            | <ul> <li>Application_id</li> <li>Change amount (int) (usually +1)</li> </ul>                                                                                                                                                                                                         |
| `setPriority`            | <ul> <li>Application_id</li> <li>Priority (int)</li> </ul>                                                                                                                                                                                                                           |
| `setPermission`          | <ul> <li>Permission_name_id</li> <li>user/org (string)</li> <li>user/org_id</li> <li>template_id</li> <li>??</li> <li>Action (add/revoke)</li> </ul>                                                                                                                                 |
| `modifyEntity`           | <ul> <li>ActionType (create/edit/delete)</li> <li>Database Table (string)</li> <li>Properties (JSON object with attribute:value pairs)</li> </ul>                                                                                                                                    |
| `duplicate`              | NOT SURE                                                                                                                                                                                                                                                                             |
| `createScheduledTrigger` | <ul> <li>Timestamp (time of execution)</li> <li>Action(s) (to execute) (array of Action objects)</li> </ul>                                                                                                                                                                          |
| `checkCondition`         | <ul> <li>Condition (expression)</li> <li>Action results (object mapping results of Condition<br/> to actions (with parameters)) E.g.</li> </ul> <pre><code class="code-highlighted code-sql">{ True: SetPermission(parameters),<br/> False: SetPermission(parameters) }</code></pre> |
| `multipleAction`         | <ul> <li>Array of action objects (to execute in sequence)</li> </ul>                                                                                                                                                                                                                 |
