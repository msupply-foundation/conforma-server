# Database Schema Application

![Database Schema](images/database-schema-application.png)

## Tables description: Application

### Application instance
The application has all the visualisation and logic defined in the <b>application template</b> [(described in Database Schema Template)](Database-Schema-Template.md). When the Applicant clicks to apply for a application type (aka template) a new instance of one application is created for them. The Applicant user can make changes until submitting the application to be reviewed.

* <b>application</b>
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

* <b>application_stage_history</b>
* <b>application_status_history</b>

### Interaction

* <b>application_reponse</b>

<b>To be considered: </b>