# List of useful functions to be added to Database

Tick when this function has been added in a PR or merged to master.

- [ ] BuildAppName: `application.name` will be deduced by the template name + user + company names

- [ ] TemplateUniqueAvailable: Whenever a template (version) is set to "Available", this function ensures any existing versions that are "Available" are set to "Disabled"

- [ ] CombineReviewDecisions: To upadte `review_section.decision` with combined `review_response.decision` done for the same `review_section`. It is basically `'Approved'` until some response in this section is marked as `'Rejected'` or `'Observations'`.

- [ ] CombineReviewSectionDecisions: To update `review.status` with combined `review_section.decision` done for the same `review`. For the status more things should be considered. And what is the priority to show:

  - Is any section still `'Awaiting review'`.
  - When one section is reviewd and approved, should show `'Approved'` or status of `'In progress'` untill all sections have some result.
  - When one section is reviewed and has observation, should show `'Non-Approvable'` even though other sections haven't been reviewed? To warn the consolidator that this review can be submitted back to the Applicant with **Changes required**.
