# Database Schema Review

![Database Schema](images/database-schema-review.png)

## Database Area description: Review

### Definition

The review is what is called when an application goes through the workflow of evaluation until its approved or rejected in the system.
The application (for example a Drug Registration) after submited goes through stages and in each one of these stage at least one review is required. In order to have the Application reviewed, there are special users in the system called Reviewer (or evaluator). The Reviewer may or may not have permission to submit the LOQ (List of Questions) back to the applicant asking for Changes required.

How many review levels required until a user can submit the reviewed application is determined by the user permission and the stage of the application template. For example, during the `'Srceening'` stage the Reviewer with lower level permission may submit the reviewed application (in case there are responses with Changes required), where in the `'Assessment'` stage another review called Consolidation should be done on top of the one done by the Reviewer with lower level permission. In this case the reviewed responses get selected by what we call the Consolidator user with the LOQ. And only those question will be retrieved to the Applicant.

## Tables

### review

A single review is created per pair of **application-stage** if required (some application don't need reviews).

The `application_id` links to the application being reviewed.

The `status` of the review is either: `'Awaiting review'`, `'In Progress'`, `'Ready'`, `'Approvable'`, `'Non-Approvable'`. The status of the whole review is defined by the combination of `review_section.decision` or if no review has started the awaiting review.

The `comment` is some overall comment that is sent to the Applicant with the review.

The `time_created` is the time when time the review has started. Defined when the first section is assigned to a reviewer.

The `trigger` is updated everytime the review has changes done by users or a scheduler. See more about [triggers](Triggers-and-Actions.md)

**To be considered:**

- The `review` is per pair of **application-stage** or one per each time it goes back to the Applicant? I think it would be always one per each pair, althugh there is a comment there which implies a overall comment to be sent to the Applicant, but what should happen with this comment after the application is re-submitted and another review should be done on the same stage?
- The `status` of `'Ready'` which is when a lower level reviewer has finished the review and the consolidation can happen is defined in the Schema latest documento of Drive as `'Reviewed'`. Is that what we have agreed? I can update it, just want to check that first.

### review section

### review section assignment

**To be considered:**

- The name `review_section_assginment` is quite long and doesn't mean much. Since the entity already stores the `section_id` should we just rename it to `review_assignement`?

### review section join

### review section response join

**To be considered:**

- Also here the name is too long `review_section_response_join` and really doesn't say much. I suggest changing this to: ??.

### review response
