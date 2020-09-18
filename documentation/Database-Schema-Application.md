# Database Schema Application

![Database Schema](images/database-schema-application.png)

## Tables description: Application

### Application instance
The application has all the visualisation and logic defined in the <b>application template</b> [(described in Database Schema Template)](Database-Schema-Template.md). When the Applicant clicks to apply for a application type (aka template) a new instance of one application is created for them. The Applicant user can make changes until submitting the application to be reviewed.

* <b>application</b>
Representation of the application instance. All nested elements are accessible via joined tables and can be created or queried in the same call using the GraphQL engine.
The `template_id` links to the template used to display all sections and elements (questions) to the user.
The `user_id` links to the Applicant user that created this application.
The `serial` is a number used to display the application number to users. 
The `name` will be deduced by the template name + user + company names.
The `is_active` is set to `'true'` for all applications that are still in the review process. 
The `is_active` is set to `'false'` for applications that have finished the review process, have expire or were withdrawn by the Applicant. 
The `trigger` is updated everytime the application has changes done by users or a scheduler. The trigger would be one of the options: `'onApplicationCreate'`, `'onApplicationSubmit'`, `'onApplicationSave'`, `'onApplicationWithdrawn'`, `'onReviewStart'`, `'onReviewEditComment'`, `'onReviewSave'`, `'onReviewAssign'`, `'onApprovalSubmit'`, `'onScheduleTime'`.
The `outcome` is either `'Pending'`, `'Approved'`, `'Rejected'`. The application is 'Pending' during the review process, each stage will store also the outcome, so it will only be updated to here once the review process is finished resulting in either 'Approved' or 'Rejected'.
<b>To be considered:</b>
   * The `unique_identifier` is a new field. What is it used for? Should is replace the `serial`?
   * An application with Draft should be flagged as `is_active`?

* <b>application_section</b>
Sections of the application that contain some elements. This is exactly the same as the `template_section`.
The `application_id` links to the application.
The `template_section_id` links to the template.
<b>To be considered: Why so we need an `application_section` and not `application_element`. We should use the same logic for both.</b>

* <b>application_stage_history</b>
There is one or more stages per application template. Each one is defined by `template_stage`. The application stage history will keep records for when the application changed to each particular stage (previously defined for this application template).
The `application_id` links to the application.
The `stage_id` links to the template stage, which will have the `name` and number of this stage.
The `time_created` defined when this stage was created.
The `is_current` is set to `'true'` while this is the current stage of this application. Otherwise is set to `'false'`.
<b>To be considered: When the application review is not in progress anymore do we keep the last `is_active` stage as `'true'`?</b>

* <b>application_status_history</b>
For each stage of the application it can have associated statuses. The application status history will keep records for when the application changed to each particular status of a stage. 
The `application_stage_history_id` links to the application stage (and the application itself).
The `status` is either `'Draft'`, `'Withdrawn'`, `'Submitted'`, `'Changes Required'`, `'Re-submitted'`, `'Completed'` and self-explanatory,
The `time_created` defined when this status of a stage was created.
The `is_current` is set to `'true'` while this is the current status of this application stage. Otherwise is set to `'false'`.

### Question response
For every new answer that the Applicant give to each resquested elements (questions) in the application a new <b>application response</b> is created. The Applicant user can make changes to responses until submitting or re-submitting the application to be reviewed. The 

* <b>application_reponse</b>
The `template_question_id` links to the template element, which defines what is the question and how to render in the application.
The `application_id` links to the application.
The `value` is what the Applicant user enter as a response.
The `time_created` defined when this response was created.
More detailed description of response coming soon: `value`.
<b>To be considered:</b>
  * Should we change `template_question_id` to `template_element_id` to keep consistent with the table name?
  * How can we flag a question to be editable by the user when Changes are required if it's only defined per template in `template_element`? Considering what was also flagged in the `application_section` we might need another `application_question` table to deal with that.