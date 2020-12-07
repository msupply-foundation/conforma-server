# Database Schema Review

![Database Schema](https://user-images.githubusercontent.com/26194949/101306386-a1cb0f00-38a9-11eb-95da-0d3947088e9c.png)

## Statuses

`Draft` -> Newly created or being edited as part of re-review or changes required from consolidator, can be edited

`Submitted` -> Cannot be edited, submitted for consolidation (at this stage, can either be with consolidators or higher up authority withing NRA or with an applicant as LOQ)

`Changes Required` -> This status is used to indicate to reviewer that changes are requested from consolidator. It would go to `Draft` when review is started (to make the required changes)

`Review Pending` -> Indicates that Applicant has replied to LOQ and needs to be re-review. It would go to `Draft` when re-review is started

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

Whenever user starts a review (either first time or subsequent times that they can edit it after submissions). We would create all responses, or duplicate them from existing responses. Trimming is done for unchanged responses after submission via an action (above rules should take into account duplicates)
