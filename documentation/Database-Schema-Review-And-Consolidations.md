# Database Schema Review

Original thinking was for review and consolidation to be separate entities, upon looking at intersection in schemas, it was apperant that they should be combined. Consolidation is really the review of a review vs review of application.

![Database Schema](images/database-schema-review.png)

## Review Levels

Each stage of application is broken down into review levels, base level (1) is the review of application, level > 1 are reviews of reviews (consolidations). Level 1 reviewer reviews application (including re-reviews as a result of applicant replying to LOQ changes), and deals with changes requested from consolidator. Likewise consolidators review reviews and make suggested decision

## Review Decision

Only available on level > 1 reviewer or when `is_last_level` in `review_assignment` is set. Consolidators can make/suggest decisions. If there is only one review level (say for screening), then the screener has the ability to create review decisions

`Conform (Approve)` -> All of the applicant's responses must be marked as approved by reviewer, and consolidator agreed with reviewers decision

`LOQ` -> At least one of applicant's responses marked as non conformity (Decline) and consolidator agreed with reviewers decisions. They have an option to select from LOQ or Non-Conformity

`Non-conofrm (Decline` -> At least one of applicant's responses marked as non conformity (Decline) and consolidator agreed with reviewers decisions. They have an option to select from LOQ or Non-Conformity

`Changes Requested` -> Applies to consolidation, if at least one disagreement with reviewer below consolidator's level, this is the only option available

## Review Assignment

These records are created by back end when review level is reached (either through application submission or review submission, see Review Life Cycle diagram below). `Template Permission` records, alongside `permission name`, `permission name join` and `permission policy` are used to created relevant `review assignments`
They can be queried to:

- Determine who can be assigned to an application stage and level <- front end task
- Determine if an application stage and level is fully assigned (using review_question_assignment link) <- through application list view
- Determine if review can be started/created <- front end can check if review can be created (including self assignment) See `Review and Consolidation URL flow` diagram below

#### Review Assignment Status

`Available` -> can be assigned by assigner
`Not Available` -> cannot be assigned by assigner, in case of `available for self assignment`, when reviewer self assigns a review, all other `review assignments` for current `stage` and `level` are changed to this status
`Assigned` -> review is assigned to a user and can be started (in case of self assignment when review is self assigned, review assignment will changes status to assigned)
`Available for self assignment` -> review can be started and self assigned

`Assignment NOTE` -> For MVP, only level 1 reviewer can be assigned questions (vs self assignment of review), level > 1 will be self assigned (level 1 can also be configured to self assigned, in this case they will need to be configured to review all sections)

##### Other fields (that are not straight away self explanatory)

`assigner_id` -> null until assigned, assigner id when assigned be assigner, otherwise reviewer_id when self assigned
`is_last_level` -> last level for current stage (determine if review_decision is present in UI)
`allowable_section_ids` -> an array of section IDs that reviewer has permission to review (would typically have all sections), assigner can only assign questions from sections that are in this list

## Review Question Assignment

Identifies which questions, from the application can be reviewed by the reviewer.
These records are created upon assignment, and should only be created for level 1 reviewer ? (to confirm)

## Review Response

Either a review of applications questions (base review, level 1) or review of review (consolidation, level > 1). See diagram (responses flow). Always created by front end, but duplicates are trimmed on back end.
Can be used to agree or disagree on overall review_decision.

A few trick bits:

##### Review Responses Are Always Duplicated i

During re-review, or in reply to changes requested, all existing review responses are duplicated (so that any changes are recorded in a new record). They are trimmed by an action on back end.

##### Review Submitted When Consolidation is in Progress

Similar to the above, but we don't duplicate `draft` review responses

#### Review Response Decision

Pretty self explanatory but one thing to note, during consolidation, it's best to think of these as `Agree and Disagree`

## Review Statuses

`Draft` -> Newly created or being edited as part of re-review or changes required from consolidator, can be edited

`Submitted` -> Cannot be edited, submitted for consolidation (at this stage, can either be with consolidators or higher up authority withing NRA or with an applicant as LOQ)

`Changes Required` -> This status is used to indicate to reviewer that changes are requested from consolidator. It would go to `Draft` when review is started (to make the required changes)

`Pending` -> Indicates that lower level changes have been made which require re-start of review. For level 1 it indicates that Applicant has replied to LOQ and it needs to be re-review. For level > 1 indicates that a review/consolidation from lower level has been submitted. (in case multiple 'parallel' reviews are being done, for every review submission, consolidation status will change to 'Pending', thus allowing indication of additional reviews needing consolidation)

`Locked` -> Used for level one reviewer. Can edit review but cannot submit. This is needed when LOQ or Non Conformity is submitted by consolidator but some of the reviews are still in draft or pending stage. They will become locked, indicating that review should be stopped for the time being

## General Description

Review flow is as follows (see review flow diagrams below):

- On application submission or on review submission, `review assignments` are created with an action
- Questions are assigned to reviewer or self assignment (using `review assignments`)
- `review` is created on front end
- `review_response` is created for each assigned question (`application_response`), or for each review_response if consolidation
- Decision is made (suggested) of either conformity or non-conformity along with a comment (for consolidation these are agree or disagree)
- Multiple `review_response` can be made for the same `application_respones` or `review_response` (consolidation), and timestamps determines the current `review_response` (this allows for consolidator to ask for changes from reviewer or reviewer to see what needs to be re-reviewed based on applicant re-submission triggered by LOQ)

### Submission Rules

Review can be submitted

- When at least 1 of the **latest** `application_response` for `template_elements` that are assigned to a reviewer in current stage of an application instance is `declined`

OR

- When all of the **latest** `application_responses` for `template_elements` that are assigned to a reviewer in current stage of an application instance are `approved`

AND

- In case of changes requested by cosolidator in review, no `review_responses` have linking `consolidation_response` with disagreements (i.e. a new `review_response` exists, that's different from review response it was duplicated from, see below)

### Creating and editing review

Whenever user starts a review (either first time or subsequent times that they can edit it after submissions), we would create all responses, or duplicate them from existing responses. Trimming is done for unchanged responses after submission via an action (above rules should take into account duplicates). Slight difference for consolidation is we only duplicate review_response that are not 'draft' and for reviews that are submitted

### Diagram

![Review Life Cycle](images/review-life-cycle.png)
![Response Flow](images/response-flow.png)
![Review and Consolidation URL flow](images/consolidation-and-review-URL-flow)

Below diagrams are somewhat outdated, but give an idea of consolidation and review process as examples

![Review Diagram](images/review-diagram.png)
![Review Schema Flow with Consolidation](images/consolidation-flow-with-schema-example.png)
![Complex Review Schema Flow with Consolidation](images/consolidation-flow-with-schema-example-complex.png)
