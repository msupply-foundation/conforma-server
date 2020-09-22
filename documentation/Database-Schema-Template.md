# Database Schema Template

![Database Schema](images/database-schema-template.png)

# Database Area description: Template

## Version

**To be re-implemented in another issue. This documentation should be edited after issue #35 is in a PR or merged to master.**

~~When the Admin user wants to edit an existing **application template** a new version is created. This new version is linked to a duplication of all records of the current **application template**. The Admin can make changes until publishing this new version.
With templates versioning we keep previous finalised applications linked to the correct versions of the application templates used.~~

~~###template version~~

~~The `is_current` is set to `'false'` while the version is being created or edited or for all versions that is not the current.~~

~~The `is_current` is set to `'true'` when the new version of one application template is published.~~

~~When a new version is added every new application of this application template will be linked to the new version.~~

**To be considered: Should we check if no applications are associated with an existing template and just add changes to the current version instead?**

## Display elements

The visualisation and questions required in each stage of an application is defined in the application template with the following entities.

### template

Representation of the application template. All nested elements are accessible via joined tables and can be created or queried in the same call using the GraphQL engine.

The `version_id` is the link with the template version.

The `template_name` and `code` is to help admin users identifying one template.

**To be re-considered after issue #35 is in PR or merged to master:**
~~The `current_status` can be `'Draft'`, `'Available'` or `'Disabled'`. The only 'Available' templates are the ones in the version flagged as the current one. All other application template are 'Disabled' or 'Draft' (if unfinalised).~~

### template stage

There is one or more stages per application template. Each one is defined as a new record that point to `template_id` with the `number` of this stage (1, 2, 3, ...) and title can be anything, but typically would be: `'Screening'`, `'Assessment'`, `'Final Stage'`.

### template sections

Sections of the application template that contain some [elements/questions](Elements-Questions.md). Each section can be associated with a **template permission** if this section requires a certain type of reviewer to check for responses from an Applicant.

### template elements

Elements in the application template always are part of a section, therefor it stores the `section_id` instead of the `template_id`.

The `code` is unique for each element in the same **template**. This code will be auto-generated, but we would allow the Admin user to change if needed.

The `next_element_code` links to the unique code of the next element to display in the application. So we order elements as a linked list.

The `title` that will be display in this question/information element to the user. Default is `'Undefined'`.

The `category` is either `'Question'` or `'Information'`. The 'Questions' are elements that will require responses from the Applicant and 'Information' elements are only structural or for visualisation.

The `visibility_condition` checks for a condition that will be evaluated and run using the [**Query syntax**](Query-Syntax.md). Examples of visibility conditions:

- checkes for any required previous elements to be answered before this element can be displayed
- check for current `stage` (e.g. only showing request for payment documentation during `'Assessment'`)
- or anything that can be expressed in a JSON query expression.

The `element_type_plugin_code` is associated with the **element type plugin**, where the definitions of each element will be coming from.

The `is_required` determines which 'Question' elements that are compulsory (when visible, defined by the **visibility_condition**).

The `is_editable` determines which 'Question' elements should be editable in which conditions. e.g. A questions that should be editable depending on the selected option of a previous Question; A question that is only editable when the **application stage** changes.

More detailed description of question elements coming soon: `parameters`, `default_value` and `validation`.

### element type plugin

Also known as the **Question plugin**, describes the plugin functions to render as part of an Application with `display_component_name` and as part of the configuration page in the template builder with `config_component_name`.

This table store what is dynamically imported to the App from the plugins folder (src/modules/plugins). The plugin `code` is the primary key. And template elements have `element_type_plugin_code` linking to the element type. Using the code will make it easier for exporting and importing a template from one system to another.

## Permission settings

Different users needs different permissions for acting on an applicatiion template. For example a user entitled as an **Applicant** would require to be associated with a template permission be able to Apply to specific application templates. Another example is the user entitled as a **Reviewer** who would require to be associated with the template review stage to be able to Review application templates on a stage or specific sections of application templates on a stage.

### template permission

The template permission is the link between users and templates. Each one can be for the entire application template with `template_id` and no `template_section_id` or have it the section defined for more specific permissions related to a section.

The `permission_policy_id` link to the actual permission policy to describe what are the policies associated to this template permission.

The `permission_join_id` links this permission to a user/company and `restrictions` would add more specific rules.

More detailed description of template permissions coming soon: `restrictions`.

## Triggered actions

The workflow of what should happen after an expected trigger in each stage of one application is defined in the application template by actions. Triggers are every change on the application, flagged by the field `trigger` which has associated actions. See more about [triggers](Triggers-and-Actions.md)

The actions logic are defined inside action plugins, which execute a function to generate some change in the database. (Link to Action plugins comming soon)

### action plugin

The `code` is unique per action plugin.

The `name` and `description` are for visualisation to help Admin users selecting what action to use for an application template.

The `path` is the local path in the server where the imported plugin is stored.

The `function_name` the name of the function to be called when the action runs.

The `required_parameters` is the name of the fields required of local object or queries to be used when the action runs.

### template action

The `template_id` links the action with the application template.

The `trigger` describes what is the trigger associated with this action. The list of possible triggers can be found [here](Triggers-and-Actions.md)

The `action_code` of the associated **action plugin**, where the definitions for the action are coming from.

The `condition` is a JSON expression that must evaluate to true for the Action to proceed.

The `parameter_queries` is an object mapping each of these fields from `action_plugin.required_parameters` to a JSON expression to provide the value to these fields.
