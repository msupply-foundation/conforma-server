# Database Schema Template

![Database Schema](images/database-schema-template.png)

## Tables description: Template

### Version
When the Admin user wants to edit an existing <b>application template</b> a new version is created. This new version is linked to a duplication of all records of the current <b>application template</b>. The Admin can make changes until publishing this new version.
With templates versioning we keep previous finalised applications linked to the correct versions of the application templates used. 

* <b>template version</b>
The `is_current` is set to `'false'` while the version is being created or edited or for all versions that is not the current.  
The `is_current` is set to `'true'` when the new version of one application template is published. 
When a new version is added every new application of this application template will be linked to the new version.

<b>To be considered: Should we check if no applications are associated with an existing template and just add changes to the current version instead?</b>

### Visualisation
The visualisation and questions required in each stage of an application is defined in the application template with the following entities. 
* <b>template</b>
Representation of the application template. All nested elements are accessible via joined tables and can be created or queried in the same call using the GraphQL engine.
The `version_id` is the link with the template version.
The `template_name` and `code` is to help admin users identifying one template.
The `current_status` can be `'Draft'`, `'Available'` or `'Disabled'`. The only 'Available' templates are the onesthe in the version flagged as the current one. All other application template are 'Disabled' or 'Draft' (if unfinalised).
* <b>template stage</b>
There is one or more stages per application template. Each one is defined as a new record that point to `tenplate_id` with the `number` of this stage (1, 2, 3, ...) and `title` can be anything, the most populars are: `'Screening'`, `'Assessment'`, `'Final Stage'`.
* <b>template sections</b>
Sections of the application template that contain some elements. Each section can be associated with a <b>template permission</b> if this section requires a certain type of reviewer to check for responses from an Applicant.
* <b>template elements</b>
Elements in the application template always are part of a section, therefor it stores the `section_id` instead of the `template_id`.
The `code` is associated with the <b>element type plugin</b>, where the definitions of each element will be coming from.
The order each element is displayed is defined by the `next_element_code` (combined with the `section_id` of the current template version).
The `visibility_condition` checks for any required previous elements to be answered before this element can be displayed. 
The `category` is either `'Question'` or `'Information'`. 
'Questions' elements will require responses from the Applicant and 'Information' elements are only structural or for visualisation. 
When the element category is 'Question' it also uses `is_required` and `is_editable` to determine its state. 
More detailed description of question elements coming soon: `validation`, `parameters`. 
* <b>element type plugin</b> 
Also known as the <b>Question plugin</b>, describes the plugin functions to render as part of an Application with `display_component_name` and as part of the configuration page in the template builder with `config_component_name`. 
This table store what is dynamically imported to the App from the plugins folder (src/modules/plugins). The plugin `code` is the primary key. And template elements have `element_type_plugin_code` linking to the element type. Using the code will make it easier for exporting and importing a template from one system to another.

### Permission settings
Different users needs different permissions for acting on an applicatiion template. For example a user entitled as an <b>Applicant</b> would require to be associated with a template permission be able to Apply to specific application templates. Another example is the user entitled as a <b>Reviewer</b> who would require to be associated with the template review stage to be able to Review application templates on a stage or specific sections of application templates on a stage.
* <b>template permission</b>
The template permission is the link between users and templates. Each one can be for the entiry application template with `template_id` and no `template_section_id` or have it the section defined for more specific permissions related to a section.
The `permission_policy_id` link to the actual permission policy to describe what are the policies associated to this template permission.
The `permission_join_id` links this permission to a user/company and `restrictions` would add more specific rules.
More detailed description of template permissions coming soon: `restrictions`.
* <b>template review stage</b>
Defines user that can review each stage of one application template.
The `template_stage_id` links to one stage of the application template (e.g. `'Screening'`).
The `permission_join_id` links this permission to a user that will be able to review this application template.
More detailed description coming soon: `name`.
<b>To be considered:</b>
  * If the reviewer is defined by `template_review_stage` then shouldn't we change the field `template_section_id` from `template_permission` to here?
  * What is the point of keeping a name here if using the `permission_join_id` would make one of this <b>per reviewer</b>. Perhaps we should change this to make the `template_review_stage` more generic removing the `permission_join_id` and adding to `template_permission` another `template_review_stage_id` to connect a permission to a user and the application template stage?

### Triggered actions
The workflow of actions that should happen after an expected trigger happens for each stage of one application is defined in the application template by actions. Triggers are every change on the application, flagged by the field `trigger` which has associated actions.
The actions logic are defined inside action plugins, which execute a function generate some change in the database.

* <b>template action</b>
The `template_id` links the action with the application template. 
The `trigger` describes what is the trigger associated with this action. The trigger would be one of the options: `'onApplicationCreate'`, `'onApplicationSubmit'`, `'onApplicationSave'`, `'onApplicationWithdrawn'`, `'onReviewStart'`, `'onReviewEditComment'`, `'onReviewSave'`, `'onReviewAssign'`, `'onApprovalSubmit'`, `'onScheduleTime'`.
The `action_code` of the associated <b>action plugin</b>, where the definitions for the action are coming from. 
The `condition` defines the environment for this action to happen.
The `parameter_queries` list the required local object or queries to be used by the <b>Query Syntax</b> when the action runs.
More detailed description of template actions coming soon: `condition`.
* <b>action plugin</b>
The `code` is unique per action plugin.
The `name` and `description` are for visualisation to help Admin users selecting what action to use for an application template.
The `path` is the local path in the server where the imported plugin is stored.
The `function_name` the name of the function to be called when the action runs.
The `requires_parameters` list the required local object or queries to be used by the <b>Query Syntax</b> when the action runs.
More detailed description on the different between `action_plugin.requires_parameters` and `action.parameter_queries` coming soon.