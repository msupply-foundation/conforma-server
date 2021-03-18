-- template_permission table

CREATE TABLE public.template_permission (
    id serial primary key,
    permission_name_id integer references public.permission_name(id),
    template_id integer references public.template(id),
    stage_number integer,
--     template_section_id integer references public.template_section(id),
    level integer,
    restrictions jsonb
);

CREATE VIEW permissions_all as (
SELECT 
    permission_policy.type as "permissionType", 
    permission_policy.id as "permissionPolicyId",
    permission_policy.rules as "permissionPolicyRules",
    permission_name.id as "permissionNameId",
    permission_name.name as "permissionName",
	template_permission.id as "templatePermissionId",
	template_permission.stage_number AS "stageNumber",
    template_permission.level AS "reviewLevel",
	template_permission.restrictions as "templatePermissionRestrictions",
	"template".id as "templateId",
    "template".code as "templateCode",
    "user".id as "userId",
    "user"."username" as "username",
    permission_join.organisation_id as "orgId",
    organisation.name as "orgName"    
FROM 
    permission_name
    join permission_join on permission_join.permission_name_id = permission_name.id
    join permission_policy on permission_policy.id = permission_name.permission_policy_id
    left join "user" on permission_join.user_id =  "user".id 
    left join organisation on permission_join.organisation_id = organisation.id
    left join template_permission on template_permission.permission_name_id = permission_name.id
    left join "template" on "template".id = template_permission.template_id );
