![Database Schema](images/database-schema-template.png)

# Database Area description: Template

## Display elements

The sections and questions required in each stage of an application is defined in the application template with the following entities.

### template

Representation of the application template. All nested elements are accessible via joined tables and can be created or queried in the same call using the GraphQL engine.

Whenever a template is modified, the new version is saved as a new template record with a new `version_timestamp`. Different versions of the same base template are connected with the same `code`. The `status` field is used to indicate which version is the current available one.

The `status` can be `'DRAFT'`, `'AVAILABLE'` or `'DISABLED'`. The version currently active in the system is the one (and only one) marked `'AVAILABLE'`.

The `name` is what users of the system will see as the "Application Type" -- e.g. "Drug Registration".

The `is_linear` is used to define the applications flow. If linear it is require each page to be complete before allowing the user to move to the next one. If not the user can go to any page, and only when trying to go to the summary page would be required that all required fields have been completed.

The `start_message`, optional JSON field **\***. When is defined the application shows a start page otherwise not. In case it is defined the start page is showed when the user clicks on the application in the list or when the user wants to start a new one.

The `submission_message`, optional JSON field **\***. It has a default general message set that will always be displayed after the application has been submitted, but a specific submission message can be defined per template.

**\*** The `JSON field` is an evaluator expression that returns a markdown string. (Query evaluation not yet implemented)

**To be considered: Should we check if no applications are associated with an existing template and just add changes to the current version instead?**

### template stage

There is one or more stages per application template. Each one is defined as a new record that point to `template_id` with the `number` of this stage (1, 2, 3, ...).

The `title` is dynamic, but typically would be: `'Screening'`, `'Assessment'`, `'Final Stage'`.

The `description` should also be defined and displayed to the user at the Submission page.

### template sections

Sections of the application template that contain some [elements/questions](Elements-Questions.md). Each section can be associated with a **template permission** if this section requires a certain type of reviewer to check for responses from an Applicant.

### template elements

See [front-end docs](https://github.com/msupply-foundation/conforma-web-app/wiki/Element-Type-Specs) for this spec.

### element type plugin

See [front-end docs](https://github.com/msupply-foundation/conforma-web-app/wiki/Element-Type-Specs) for this spec.

The `display_component_name` references the UI component the applicant sees when filling in the form.

The `config_component_name` refers to the UI component used to create the question/element in the [Template Builder](https://github.com/msupply-foundation/conforma-web-app/wiki/Template-Builder).

## Permission settings

Different users needs different permissions for acting on an application template.

For example an **Applicant user** would be required to be associated with a template permission in order to **Apply** to a specific application of a template type. Another example is a **Reviewer user** who would be required to be associated with a template permission in order to **Review** applications of a specific template type (or specific sections of the application of a template type) on a certain stage.

### template permission

The template permission is the link between `templates` and `policies` (linked by permission_name) in a given `stage`, then users with the same permission_name will be allowed to act on the previously linked template. Each one can be for the entire template in `template_id` or specific sections when `allowed_sections` array has some section(s) defined for more specific permissions related to a section in the application.

- `template_id` link to the actual template associated with a policy which will give permissions to users later.
- `permission_name_id` links this permission to a user/organisation.
- `allowed_sections` [**Default**: `NULL`] Array of sections allowed (when using only to allow the permission on specific sections in the application)
- `can_self_assign` [**Default**: `false`] Option only for Reviewer permission `true` if the user associated can self-assign to review applications of this template.
- `stage_number` specify stage associated for this permission.
- `level_number` specify the review level for this permission.
- `restrictions` would add more specific rules. More details and examples to be added later.

## Triggered actions

The workflow of what should happen after an expected trigger in each stage of one application is defined in the application template by actions. Triggers are every change on the application, flagged by the field `trigger` which has associated actions. See more about [triggers](Triggers-and-Actions.md)

The actions logic are defined inside action plugins, which execute a function to generate some change in the database. (Link to Action plugins comming soon)

### action plugin

The `code` is unique per action plugin.

The `name` and `description` are for visualisation to help Admin users selecting what action to use for an application template.

The `required_parameters` is the name of the fields required of local object or queries to be used when the action runs.

### template action

The `template_id` links the action with the application template.

The `trigger` describes what is the trigger associated with this action. The list of possible triggers can be found [here](Triggers-and-Actions.md)

The `action_code` of the associated **action plugin**, where the definitions for the action are coming from.

The `condition` is a JSON expression that must evaluate to true for the Action to proceed.

The `parameter_queries` is an object mapping each of these fields from `action_plugin.required_parameters` to a JSON expression to provide the value to these fields.
