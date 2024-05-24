CREATE OR REPLACE FUNCTION application_detail (applicationId int, userid int DEFAULT 0)
    RETURNS SETOF application_list_shape
    AS $$
    SELECT
        -- BASE
        app.id,
        app.serial,
        app.name,
        template.code AS template_code,
        template.name AS template_name,
        CONCAT(applicant.first_name, ' ', applicant.last_name) AS applicant_name,
        org.name AS org_name,
        stage_status.stage,
        stage_status.stage_colour,
        stage_status.status,
        app.outcome,
        status_history_time_created AS last_active_date,
        ts.time_scheduled AS applicant_deadline,
        -- REVIEWERS and ASSIGNERS
        CASE WHEN count(assigner_user.id) = 0 THEN
            NULL
        ELSE
            ARRAY_AGG(DISTINCT (CONCAT(assigner_user.first_name, ' ', assigner_user.last_name)::varchar))
        END AS assigners,
        CASE WHEN count(reviewer_user.id) = 0 THEN
            NULL
        ELSE
            ARRAY_AGG(DISTINCT (CONCAT(reviewer_user.first_name, ' ', reviewer_user.last_name)::varchar))
        END AS reviewers,
        -- REVIEWER ACTIONS
        CASE WHEN COUNT(*) FILTER (WHERE action_review_status_history.status = 'CHANGES_REQUESTED') != 0 THEN
            'UPDATE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE action_review_status_history.status = 'PENDING') != 0 THEN
            'RESTART_REVIEW'
        WHEN COUNT(*) FILTER (WHERE action_review_status_history.status = 'DRAFT'
            AND review_is_locked (action_review) = FALSE) != 0 THEN
            'CONTINUE_REVIEW'
        WHEN COUNT(*) FILTER (WHERE reviewer_assignment.status = 'ASSIGNED'
            AND reviewer_assignment.is_final_decision = TRUE
            AND reviewer_assignment.is_last_stage = TRUE
            AND action_review = NULL) != 0 THEN
            'MAKE_DECISION'
        WHEN COUNT(*) FILTER (WHERE reviewer_assignment.status = 'ASSIGNED'
            AND action_review.id IS NULL) != 0 THEN
            'START_REVIEW'
        -- anyarray <@ anyarray → boolean 
        -- "Is the first array contained by the second?"
        -- select (ARRAY[5,3,1] <@ ARRAY[2,3,5]) = false (results in true)
        -- select (ARRAY[5,3] <@ ARRAY[2,3,5]) = false (results in false)
        -- thus below should be true if allowed_section has a section that is not in assigned_sections
        WHEN COUNT(*) FILTER (WHERE (allowed_self_assignable_sections.allowed_sections <@ review_assignment_assigned_sections.assigned_sections) = false
            AND action_review.id IS NULL) != 0 THEN
            'SELF_ASSIGN'
        WHEN COUNT(*) FILTER (WHERE (stage_status.status = 'CHANGES_REQUIRED'
            OR stage_status.status = 'DRAFT')
            AND reviewer_assignment.status = 'ASSIGNED'
            AND action_review_status_history.status = 'SUBMITTED') != 0 THEN
            'AWAITING_RESPONSE'
        WHEN COUNT(*) FILTER (WHERE reviewer_assignment.status = 'ASSIGNED'
            OR action_review_status_history.status = 'SUBMITTED') != 0 THEN
            'VIEW_REVIEW'
        ELSE
            NULL
        END::reviewer_action,
        -- ASSIGNER ACTIONS
        CASE
        -- Using MIN because number_of_assigned_sections is for each level (i.e. there are multiple levels grouped by stage_id)
        WHEN MIN(assigned_sections_by_stage_and_level.assigned_section_for_level) < COUNT(DISTINCT (assignable_sections.id)) THEN
            'ASSIGN'
        WHEN MIN(assigned_sections_by_stage_and_level.assigned_in_progress_sections) = COUNT(DISTINCT (assignable_sections.id)) THEN
            'RE_ASSIGN'
        ELSE
            NULL
        END::assigner_action
    FROM
        -- BASE
        public.application app
        JOIN public.template ON app.template_id = template.id
        JOIN public."user" AS applicant ON app.user_id = applicant.id
        LEFT JOIN public.application_stage_status_latest AS stage_status ON app.id = stage_status.application_id
        LEFT JOIN public.organisation org ON app.org_id = org.id
        LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
            AND ts.is_active = TRUE
            AND ts.event_code = 'applicantDeadline'
            -- REVIEWERS and ASSIGNERS
    LEFT JOIN review_assignment AS assigned_assignment ON (assigned_assignment.application_id = app.id
            AND assigned_assignment.stage_id = stage_status.stage_id
            AND assigned_assignment.status = 'ASSIGNED')
    LEFT JOIN public."user" AS assigner_user ON assigned_assignment.assigner_id = assigner_user.id
    LEFT JOIN public."user" AS reviewer_user ON assigned_assignment.reviewer_id = reviewer_user.id
    -- REVIEWER ACTIONS
    LEFT JOIN review_assignment AS reviewer_assignment ON (reviewer_assignment.application_id = app.id
            AND reviewer_assignment.stage_id = stage_status.stage_id
            AND app.outcome = 'PENDING'
            AND reviewer_assignment.reviewer_id = userId)
    LEFT JOIN review AS action_review ON action_review.review_assignment_id = reviewer_assignment.id
    LEFT JOIN review_status_history AS action_review_status_history ON (action_review_status_history.review_id = action_review.id
            AND action_review_status_history.is_current = TRUE)
        -- ASSIGNER ACTIONS
    LEFT JOIN assigned_sections_by_stage_and_level ON (assigned_sections_by_stage_and_level.application_id = app.id
            AND assigned_sections_by_stage_and_level.stage_id = stage_status.stage_id
            AND app.outcome = 'PENDING'
            AND assigned_sections_by_stage_and_level.assigner_id = userId)
    LEFT JOIN template_section AS assignable_sections ON assignable_sections.template_id = template.id
    LEFT JOIN allowed_self_assignable_sections(userId) AS allowed_self_assignable_sections ON allowed_self_assignable_sections.review_assignment_id = reviewer_assignment.id
    LEFT JOIN review_assignment_assigned_sections(userId) as review_assignment_assigned_sections ON review_assignment_assigned_sections.review_assignment_id = reviewer_assignment.id
WHERE
    app.id = applicationId
GROUP BY
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12,
    13,
    stage_status.stage_id

$$
LANGUAGE sql
STABLE;



-- Function to update assigner/reviewer lists on applications and insert/update
-- reviewer/assigner actions on application_reviewer_action
DROP FUNCTION IF EXISTS public.update_application_reviewer_stats CASCADE;
CREATE OR REPLACE FUNCTION public.update_application_reviewer_stats ()
    RETURNS TRIGGER
     -- This allows the function to be run as admin user, otherwise it'll only
     -- be able to query rows the current user has access to.
    SECURITY DEFINER
    AS $$

DECLARE
    reviewer_ids integer[];
    rev_id integer;
    assigner_ids integer[];
    ass_id integer;

BEGIN
-- reviewer and assigner lists
    IF TG_OP != 'INSERT' THEN
        WITH lists AS (
                SELECT reviewers, assigners
                FROM application_detail(NEW.application_id)
            ) 
        UPDATE public.application
            SET reviewer_list = (SELECT reviewers FROM lists),
            assigner_list = (SELECT assigners FROM lists)
            WHERE id = NEW.application_id;
    END IF;

    -- Get list of reviewer_ids to update for 
    IF TG_OP = 'UPDATE' THEN
        reviewer_ids = ARRAY(
            SELECT reviewer_id FROM review_assignment
            WHERE application_id = NEW.application_id
        );
    ELSE
        reviewer_ids = ARRAY[NEW.reviewer_id];
    END IF;

    FOREACH rev_id IN ARRAY reviewer_ids LOOP
        -- Delete previous
        UPDATE public.application_reviewer_action
            SET reviewer_action = NULL
            WHERE application_id = NEW.application_id
            AND user_id = rev_id;

        -- Insert new
        WITH reviewer_action AS (
            SELECT reviewer_action
                FROM application_detail(NEW.application_id, rev_id)
            ) 
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, reviewer_action)  
        VALUES(
            rev_id,
            NEW.application_id,
            (SELECT reviewer_action FROM reviewer_action)
         )
         ON CONFLICT (user_id, application_id)
         DO UPDATE
            SET reviewer_action = (SELECT reviewer_action FROM reviewer_action);
    END LOOP;
    
    
    -- ASSIGNERS
    IF TG_OP = 'UPDATE' THEN
        assigner_ids = ARRAY(
            SELECT assigner_id FROM review_assignment
            WHERE application_id = NEW.application_id
            AND assigner_id IS NOT NULL
        );
    ELSE
        CASE WHEN NEW.assigner_id IS NULL THEN
                assigner_ids = ARRAY[];
            ELSE
                assigner_ids = ARRAY[NEW.assigner_id];
            END CASE;
    END IF;

    FOREACH ass_id IN ARRAY assigner_ids LOOP
        -- Delete previous
        UPDATE public.application_reviewer_action
            SET assigner_action = NULL
            WHERE application_id = NEW.application_id
            AND user_id = ass_id;

        -- Insert new
        WITH assigner_action AS (
            SELECT assigner_action
                FROM application_detail(NEW.application_id, ass_id)
            ) 
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, assigner_action)  
        VALUES(
            ass_id,
            NEW.application_id,
            (SELECT assigner_action FROM assigner_action)
         )
         ON CONFLICT (user_id, application_id)
         DO UPDATE
            SET assigner_action = (SELECT assigner_action FROM assigner_action);
    END LOOP;

    -- Deleting review assignment records shouldn't happen in the normal course
    -- of the app, but it can happen when we manually manipulate the database.
    -- In this case, we would want to clean up the application_reviewer_action
    -- too.
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, reviewer_action)
        VALUES(NEW.reviewer_id, NEW.application_id, NULL);
        
        IF NEW.assigner_id IS NOT NULL THEN
            INSERT INTO public.application_reviewer_action
                (user_id, application_id, assigner_action)
            VALUES(NEW.assigner_id, NEW.application_id, NULL);
        END IF;
    END IF;

    -- Clean up NULL records
    DELETE FROM public.application_reviewer_action
    WHERE application_id = NEW.application_id
    AND reviewer_action IS NULL
    AND assigner_action IS NULL;

RETURN NULL;

END;
$$
LANGUAGE plpgsql;


-- Trigger for the above on review_assignment
DROP TRIGGER IF EXISTS update_application_reviewer_stats ON public.review_assignment;
CREATE TRIGGER update_application_reviewer_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.review_assignment
    FOR EACH ROW
    EXECUTE FUNCTION public.update_application_reviewer_stats ();

-- Function to update insert/update reviewer/assigner actions on
-- application_reviewer_action when status are updated
DROP FUNCTION IF EXISTS public.update_reviewer_stats_from_status CASCADE;
CREATE OR REPLACE FUNCTION public.update_reviewer_stats_from_status ()
    RETURNS TRIGGER
     -- This allows the function to be run as admin user, otherwise it'll only
     -- be able to query rows the current user has access to.
    SECURITY DEFINER
    AS $$

DECLARE
    app_id integer;
    rev_id integer;
    ass_id integer;

BEGIN
    -- Get application id
    app_id = (
        SELECT r.application_id FROM review r
        WHERE id = NEW.review_id
    );

    -- Get reviewer_id and assigner_id
    SELECT ra.reviewer_id, ra.assigner_id
        INTO rev_id, ass_id
        FROM review_assignment ra
        WHERE id = (
            SELECT review_assignment_id FROM review
            WHERE id = NEW.review_id
        );
        
    -- Update reviewer
    UPDATE public.application_reviewer_action
            SET reviewer_action = NULL
            WHERE application_id = app_id
            AND user_id = rev_id;

    WITH reviewer_action AS (
            SELECT reviewer_action
                FROM application_detail(app_id, rev_id)
            ) 
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, reviewer_action)  
        VALUES(
            rev_id,
            app_id,
            (SELECT reviewer_action FROM reviewer_action)
         )
         ON CONFLICT (user_id, application_id)
         DO UPDATE
            SET reviewer_action = (SELECT reviewer_action FROM reviewer_action);

    -- Update assigner
    UPDATE public.application_reviewer_action
            SET assigner_action = NULL
            WHERE application_id = app_id
            AND user_id = ass_id;

    WITH assigner_action AS (
            SELECT assigner_action
                FROM application_detail(app_id, ass_id)
            ) 
        INSERT INTO public.application_reviewer_action
            (user_id, application_id, assigner_action)  
        VALUES(
            ass_id,
            app_id,
            (SELECT assigner_action FROM assigner_action)
         )
         ON CONFLICT (user_id, application_id)
         DO UPDATE
            SET assigner_action = (SELECT assigner_action FROM assigner_action);


    -- Clean up NULL records
    DELETE FROM public.application_reviewer_action
    WHERE application_id = NEW.application_id
    AND reviewer_action IS NULL
    AND assigner_action IS NULL;

RETURN NULL;

END;
$$
LANGUAGE plpgsql;


-- Trigger for the above on review_stage_history
DROP TRIGGER IF EXISTS update_reviewer_stats_from_status ON public.review_status_history;
CREATE TRIGGER update_reviewer_stats_from_status
    AFTER INSERT ON public.review_status_history
    FOR EACH ROW
    EXECUTE FUNCTION public.update_reviewer_stats_from_status ();

-- VIEW to return all required application list data
DROP VIEW IF EXISTS application_list;
CREATE OR REPLACE VIEW application_list AS (
	SELECT
	 app.id,
	 app.serial,
	 app.name,
	 stage_status.template_code, 
	 stage_status.template_name,
	 "user".full_name as applicant_name,
	 organisation.name as org_name,
	 stage_status.stage,
	 stage_status.stage_colour,
	 stage_status.status,
	 app.outcome,
	 status_history_time_created AS last_active_date,
	 ts.time_scheduled AS applicant_deadline,
	 app.reviewer_list AS reviewers,
	 app.assigner_list AS assigners,
	 actions.user_id AS reviewer_id,
	 reviewer_action,
	 assigner_action
	FROM application app
		LEFT JOIN application_stage_status_latest as stage_status
			ON app.id = stage_status.application_id
		LEFT JOIN "user" 
			ON app.user_id = "user".id
		LEFT JOIN organisation
			ON app.org_id = organisation.id
		LEFT JOIN trigger_schedule ts ON app.id = ts.application_id
	            AND ts.is_active = TRUE
	            AND ts.event_code = 'applicantDeadline'
		LEFT JOIN application_reviewer_action actions
			ON app.id = actions.application_id
)