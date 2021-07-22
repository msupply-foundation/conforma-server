CREATE FUNCTION application_list_filter_applicant (applicant varchar, template_code varchar)
    RETURNS TABLE (
        applicant varchar
    )
    AS $$
    SELECT DISTINCT
        (applicant)
    FROM
        application_list ()
    WHERE
        applicant ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_organisation (organisation varchar, template_code varchar)
    RETURNS TABLE (
        organisation varchar
    )
    AS $$
    SELECT DISTINCT
        (org_name)
    FROM
        application_list ()
    WHERE
        org_name ILIKE CONCAT('%', $1, '%')
        AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_reviewer (reviewer varchar, template_code varchar)
    RETURNS TABLE (
        reviewer varchar
    )
    AS $$
    SELECT DISTINCT
        reviewers_unset
    FROM
        application_list (),
        unnest(reviewers) reviewers_unset
WHERE
    reviewers_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_assigner (assigner varchar, template_code varchar)
    RETURNS TABLE (
        assigner varchar
    )
    AS $$
    SELECT DISTINCT
        assigners_unset
    FROM
        application_list (),
        unnest(assigners) assigners_unset
WHERE
    assigners_unset ILIKE CONCAT('%', $1, '%')
    AND template_code = $2
$$
LANGUAGE sql
STABLE;

CREATE FUNCTION application_list_filter_stage (template_code varchar)
    RETURNS TABLE (
        stage varchar
    )
    AS $$
    SELECT DISTINCT
        (stage)
    FROM
        application_list ()
    WHERE
        template_code = $1
$$
LANGUAGE sql
STABLE;

