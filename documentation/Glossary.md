## Glossary of Terms

_Note: these are intended as “Development” terms so we understand and have consistency around the entities and concepts. “User” terms can come later._

### Applications

**Application Template** (aka **Form, Type, Template**) — the core “Configuration” entity specifying the forms to be filled, the fields and their types, and the actions associated with them. The user interface for creating Templates is known as the **Template Builder**.

In Old IRIMS terms: PROCEDURE.

**Application** — a specific instance of an Application Template e.g. “user registration application for John Smith”. Entity includes the data supplied by the user, the current state of the forms (possibly including their history), as well as the review comments and status.

**Section** — A logical sub-section of an application template. This concept is needed as reviewers can be assigned to different sections of an application based on their expertise, etc.

**Page** — A visual grouping of form steps -- i.e. things that will be shown together. Distinct from “Section”, as Section refers to a logical subset of the Application (with its own assignments, status, etc.) whereas “Page” is purely a visual thing. You would expect each Section to have several Pages if there are a lot of questions to answer.

**Group** — Questions can be “grouped” (or can be left ungrouped). Grouped questions share a visual “grouping”, and can be flowed horizontally within the flex box (if space permits), and can also share a common “visibility_condition”.

**Question** — A single “user field” or “requirement” in an application E.g. Name info, document upload, permission request, etc -- Includes all data relevant to this part of the process, not just the “user-facing” bits. Data fields would include, at a minimum: Label(s), Type(s) (text, checkbox, etc.), isRequired (boolean), NextStep (conditional, based on response), Reviewer comments, Review status (Approved/Unapproved/Revise request).

**Response** — an applicant’s “Answer” to a specific question in a specific application.

**Question Type** — A type of field that can be used in a form. E.g. Text entry, Selector, Multi-select. Defined as “plug-ins”, but we’ll have a default set initially, with new ones created as required. Also know as **Element Type** as it can include proper _questions_ as well as **Information Type** elements, which are form elements that don't require a response (e.g. Infobox, Image, etc.)

**Stage** — A defined stage an application (or Section) must go through. Basic Drug registration would have the stages “Screening”, “Assessment” and “Final Approval”, for example.

**Status** — The “state” of an application at any given time, which would affect what can be done with it. E.g. “Submitted” -- would mean it can be assigned to be reviewed, but not edited by the applicant. “Under Review” would mean it can have response approvals and comments added by a Reviewer. Final Status is “Complete”, which (probably) puts it into a read-only state.

**Outcome** — The final result of an application. Will most likely be either “Approved” or “Rejected” once it reaches the “Complete” status, and before that would be “Pending” (or perhaps Null).

**Trigger** — A type of Event listener that responds to changes in the database or environment to launch “Actions”. Examples might be “OnSubmit”, “OnReviewSubmit”, “OnApproval”, etc. Can be in response to user-initiated events (like those examples) or time-based, such as schedulers (e.g. if an application must be responded to within a certain time limit, an Action would be Triggered when that time is reached)

**Action** — something that happens in response to a “trigger condition” (e.g. OnSubmit, OnApproval, etc.) Can be simple notifications (“Send email”) or more complex, including triggering other actions, or changing the Stage or Status of an application. Actions are defined in plugins, so more can be written and added as needed. (See [Triggers & Actions](Triggers-and-Actions.md))

### Permissions

**Operation (**aka** Permission Type, Policy)** — a policy defining permissions on the Database. These will generally correspond to “Verbs” of “things you can do”, such as “Apply”, “Review”, “Consolidate”, “Finalise”. Will mostly be pre-defined in the system, but more complex policies can be created if required (but probably not via UI initially).

**Permission (Name** aka **Permission Link**) — A “link” between an Operation and an Application Template (or set of them). When creating a new Application Template, the admin can select from existing Permissions, or create new ones. Basically a “tag” that is applied to a particular Operation on an application template and a User must be given this “tag” in order for them to be able to perform the Operation. Examples include: “Apply on behalf of company”, “Has medical reviewing qualification”, “Can assign Type B applications to other reviewers”.

(Could also be thought of as a “criterion” or a “filter” for whether a user is allowed to do a particular Operation on a particular Application Type.)

**Permission Field Type** — A field type (above) that is specifically for selecting permissions to be applied for.

**Operation** — a “thing you can do” with an application. E.g. “Apply”, “View”, “Review”, “Consolidate”, “Finalise”. These probably need to be defined quite precisely and probably baked into the system. However, in the Application Template setup, you’ll be able to choose which operations are relevant (e.g. for a User Registration, only “Apply” and “Approve” might be needed).

**_Actions vs Operations_** — “Actions” happen automatically in response to conditions. “Operations” are “verbs” that users do.

### People

**User** — any one who has an account on the system. Includes individual applicants, reviewer and admins, etc. Each individual person should have one (and only one) user account. Users will apply for/be given “permissions” to view or do specific “operations” with specific application “types” (templates).

**Organisation** — A company or other organisation that has products to be assessed by reviewers. Organisations will need to be entities in the system, but they are not _users_. Users are assigned to, or associated with, organisations. Each organisation needs at least one “owner” user (by default, the user who applied for the organisation to be created), who can add new users to the organisation and do other management tasks.

### Reviewing Terminology

**Review** — being able to comment and approve application steps

**Approve** — for each _response_ above. (need a different term for approving whole application or section -- is that “finalise”?)

**Consolidate** — ??

**Finalise** — Final assessment on application (Rejected/Approved). Probably done by Admin (someone with high-level privileges)
