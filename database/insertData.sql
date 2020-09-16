SET search_path = public;

-- (Template) application types

--insert into element_plugin
--(type, default_option_name, default_option_value)
--values
--('Short Text', 'Untitled question', '{"text":""}'),
--('Dropdown', 'Untitled question', '{"options": ["option 1"]}'),
--('File Upload', 'Upload a file', '{"path":"/"}');

-- TEMPLATES

-- Template A - User registration 
-- Application setup

insert into template_version
(number, time_created, is_current)
values
(1, NOW(), true);

insert into template
(version_id, template_name, code)
values
(1, 'User Registration', 'UserRego1');

insert into template_section
(template_id, title, code)
values
(1, 'Section 1', 'S1'),
(1, 'Section 2', 'S2');

-- Application fields

insert into template_information
(section_id, next_element_id, code, title, element_type_plugin_code, parameters)
values (1, 2, 'GS1', 'Group 1', 'group_start', '{}');

insert into template_question
(section_id, next_element_id, code, title, element_type_plugin_code, visibility_condition, is_required, is_editable, parameters)
values
(1, 3, 'Q1', 'First Name', 'short_text','{"value": true}', true, true, '{"label": "First Name"}'),
(1, 4, 'Q2', 'Surname', 'short_text', '{"value": true}', true, true, '{"label": "Last Name"}');

insert into template_information
(section_id, next_element_id, code, title, element_type_plugin_code, parameters)
values
(1, 5, 'GE1', 'Group 1', 'group_end', '{}'),
(1, 6, 'BR1', 'Page 1', 'page_break', '{}');

insert into template_question
(section_id, next_element_id, code, title, element_type_plugin_code, visibility_condition, is_required, is_editable, parameters)
values
(1, Null, 'Q3', 'Company', 'drop_down','{"value": true}', true, true, '{"label": "Select your company", "options": ["Company A, Company B"]}');


-- Template B - Company registration 
-- Application setup

insert into template_version
(number, time_created, is_current)
values
(1, NOW(), true);

insert into template
(version_id, template_name, code)
values
(2, 'Company Registration', 'CompRego1');

insert into template_section
(template_id, title, code)
values
(2, 'Section 1', 'S1'),
(2, 'Section 2', 'S2'),
(2, 'Section 3', 'S3');

-- Application fields

insert into template_information
(section_id, next_element_id, code, title, element_type_plugin_code, parameters)
values
(4, 8, 'GS1', 'Group 1', 'group_start', '{}');

insert into template_question
(section_id, next_element_id, code, title, element_type_plugin_code, visibility_condition, is_required, is_editable, parameters)
values
(4, 9, 'Q1', 'Organisation Name', 'short_text',  '{"value": true}', true, true, '{"label": "Unique name for company"}'),
(4, 10, 'Q2', 'Organisation activity', 'drop_down', '{"value": true}', true, true, '{"label": "Select the type of activity", "options": ["Manufacturer", "Importer", "Producer"]}');

insert into template_information
(section_id, next_element_id, code, title, element_type_plugin_code, parameters)
values
(4, Null, 'GE1', 'Group 1', 'group_end', '{}');

-- Adding users
insert into "user"
(username, password, email, role)
values
-- 1
('nmadruga', 1234, 'nicole@sussol.net', 'Applicant'),
-- 2
('carl', 1234, 'carl@sussol.net', 'Applicant'),
-- 3
('andrei', 1234, 'andrei@sussol.net', 'Applicant'),
-- 4
('valerio', 5678, 'valerio@nra.org', 'Reviewer');

-- Applications

insert into application
(template_id, user_id, serial, name, is_active, outcome)
values
(1, Null, 100, 'User registration: Nicole Madruga', true, 'Pending'),
(1, Null, 101, 'User registration: Carl Smith', true, 'Pending'),
(2, Null, 102, 'Company registration: Company C', true, 'Pending');

insert into application_section
(application_id, template_section_id)
values
(1, 1),
(1, 2),
(2, 1),
(2, 2),
(3, 3),
(3, 4),
(3, 5);

insert into application_response
(template_question_id, value, time_created)
values
-- User 1
(1, '{"text":"Nicole"}', NOW() ),
(1, '{"text":"Madruga"}', NOW() ),
(5, '{"option":"1"}', NOW() ),
-- User 2
(1, '{"text":"Carl"}', NOW() ),
(2, '{"text":"Smith"}', NOW() ),
(5, '{"option":"1"}', NOW() ),
-- Company C
(4, '{"text":"Company C"}', NOW() ),
(5, '{"option":"2"}', NOW() );

-- User rego 1
insert into application_stage_history
(application_id, stage, time_created, is_current)
values
(1, 'Screening', NOW(), true);

insert into application_status_history
(application_stage_history_id, status, time_created, is_current)
values
(1, 'Completed', NOW(), true);

update application_stage_history
set is_current = false
where id = 1;

insert into application_stage_history
(application_id, stage, time_created, is_current)
values
(1, 'Assessment', NOW(), true);

update application_status_history
set is_current = false
where id = 1;

insert into application_status_history
(application_stage_history_id, status, time_created, is_current)
values
(2, 'Submitted', NOW(), true);

-- User rego 2
insert into application_stage_history
(application_id, stage, time_created, is_current)
values
(2, 'Screening', NOW(), true);

insert into application_status_history
(application_stage_history_id, status, time_created, is_current)
values
(3, 'Completed', NOW(), true);

update application_stage_history
set is_current = false
where id = 3;

insert into application_stage_history
(application_id, stage, time_created, is_current)
values
(2, 'Assessment', NOW(), true);

update application_status_history
set is_current = false
where id = 3;

insert into application_status_history
(application_stage_history_id, status, time_created, is_current)
values
(4, 'Submitted', NOW(), true);

-- Company rego 1
insert into application_stage_history
(application_id, stage, time_created, is_current)
values
(3, 'Screening', NOW(), true);

insert into application_status_history
(application_stage_history_id, status, time_created, is_current)
values
(4, 'Submitted', NOW(), true);


-- A sample Action for Template "Company Registration"
INSERT INTO public.action_plugin (code, "name", description, path, function_name, required_parameters)
VALUES ('cLog', 'Console Log', 'All it does is print a message to the console.', 'action_console_log/src/consoleLog.js', 'consoleLog', '{message}');

INSERT INTO public.template_action (id, template_id, action_code, previous_action_id, "trigger", condition, parameter_queries) VALUES (1, 2, 'cLog', NULL, 'onApplicationSubmit', '{"type": "boolean", "value": true}', '{"message": {"type": "string", "value": "The Action has been executed. Automated Actions FTW!!!"}}');
