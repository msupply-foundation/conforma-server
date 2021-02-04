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

## Review Statuses

`Draft` -> Newly created or being edited as part of re-review or changes required from consolidator, can be edited

`Submitted` -> Cannot be edited, submitted for consolidation (at this stage, can either be with consolidators or higher up authority withing NRA or with an applicant as LOQ)

`Changes Required` -> This status is used to indicate to reviewer that changes are requested from consolidator. It would go to `Draft` when review is started (to make the required changes)

`Pending` -> Indicates that lower level changes have been made which require re-start of review. For level 1 it indicates that Applicant has replied to LOQ and it needs to be re-review. For level > 1 indicates that a review/consolidation from lower level has been submitted. (in case multiple 'parallel' reviews are being done, for every review submission, consolidation status will change to 'Pending', thus allowing indication of additional reviews needing consolidation)

`Locked` -> Used for level one reviewer. Can edit review but cannot submit. This is needed when LOQ or Non Conformity is submitted by consolidator but some of the reviews are still in draft or pending stage. They will become locked, indicating that review should be stopped for the time being

### General Description

Review flow is as follows:

- Questions are assigned to reviewer
- `review` is created
- `review_response` is created for each assigned question (`application_response`)
- Decision is made (suggested) of either conformity or non-conformity along with a comment
- Multiple `review_response` can be made for the same `application_respones`, and timestamps determines the current `review_response` (this allows for consolidator to ask for changes from reviewer)

### Submission Rules

Review can be submitted

- When at least 1 of the **latest** `application_response` for `template_elements` that are assigned to a reviewer in current stage of an application instance is `declined`

OR

- When all of the **latest** `application_responses` for `template_elements` that are assigned to a reviewer in current stage of an application instance are `approved`

AND (see consolidation schema TODO)

- In case of changes requested by cosolidator in review, no `review_responses` have linking `consolidation_response` with disagreements (i.e. a new `review_response` exists, that's different from review response it was duplicated from, see below)

### Creating and editing review

Whenever user starts a review (either first time or subsequent times that they can edit it after submissions), we would create all responses, or duplicate them from existing responses. Trimming is done for unchanged responses after submission via an action (above rules should take into account duplicates)

### Other material

Few more diagrams:

![Review Diagram](images/review-diagram.png)
![Review Schema Flow with Consolidation](images/consolidation-flow-with-schema-example.png)
![Complex Review Schema Flow with Consolidation](images/consolidation-flow-with-schema-example-complex.png)
