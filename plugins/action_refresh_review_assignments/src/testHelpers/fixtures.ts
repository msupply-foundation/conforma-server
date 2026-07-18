/**
 * Self-contained DB fixtures for the refreshReviewAssignments test suites.
 *
 * All rows use explicit ids in the 90000-90999 range (verified unused by any
 * snapshot data), so the suites can run against any database state and clean
 * up after themselves without a snapshot restore. Seeded rows never set a
 * "trigger" column, so no trigger_queue/action processing is provoked.
 *
 * Shared characterization suite uses ids 90001-90099.
 * New-behaviour (gated) suite uses ids 90101-90199.
 */

// ----- Shared-suite ids ---------------------------------------------------

export const USER_U = 90001 // the target user being refreshed
export const USER_V = 90002 // isolation control user (must never change)
export const ORG = 90001

export const T1 = 90001 // two stages; stage 2 has two review levels
export const T2 = 90002 // one stage/level; U has NO permissions here

export const T1_STAGE_1 = 90001
export const T1_STAGE_2 = 90002
export const T2_STAGE_1 = 90003

export const LEVEL_T1_S1_L1 = 90001
export const LEVEL_T1_S2_L1 = 90002
export const LEVEL_T1_S2_L2 = 90003
export const LEVEL_T2_S1_L1 = 90004

export const APP_GRANT = 90001 // S1 SUBMITTED PENDING; U row gets created
export const APP_FIRST_DRAFT = 90002 // S1 DRAFT PENDING, no assignments; skipped
export const APP_APPROVED = 90003 // outcome APPROVED; never touched
export const APP_ASSIGNED = 90004 // S2; U already ASSIGNED at L1; no L2 rows (level capping)
export const APP_DRAFT_LATER = 90005 // S1 DRAFT but assignments exist (changes-required); processed
export const APP_TWO_LEVELS = 90006 // S2 with existing L1+L2 rows; U rows created at both levels
export const APP_REVOKED = 90007 // T2; U has stale ASSIGNED row + review; U has no T2 permission

export const REVIEW_ON_REVOKED = 90001 // review hanging off U's stale assignment (cascade check)

// Fixed timestamps so time_stage_created literals are stable
export const T0 = '2026-01-01T00:00:00Z'
export const T0_LITERAL = '2026-01-01T00:00:00' // as read back via to_char UTC
const OLD_TS = '2025-12-01T00:00:00Z'

// ----- Cleanup ------------------------------------------------------------

// Run before seeding (crash-resilient) and in afterAll. Order matters:
// - application cascades review_assignment -> review/joins, histories,
//   application_reviewer_action and application-linked activity_log
// - template cascades template_stage/levels/sections/template_permission
//   (template_permission must go before permission_name: plain FK, no cascade)
// - permission_join before permission_name; its delete trigger writes
//   PERMISSION activity_log rows, so activity_log is cleaned last
export const CLEANUP_SQL = `
DELETE FROM public.application WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.template WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.permission_join WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.permission_name WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.permission_policy WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public."user" WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.organisation WHERE id BETWEEN 90000 AND 90999;
DELETE FROM public.activity_log WHERE type = 'PERMISSION' AND record_id BETWEEN 90000 AND 90999;
`

// ----- Shared-suite seed ----------------------------------------------------

// Permission layout for U (target):
//   T1 S1 L1  REVIEW, sections NULL                    (no-org)
//   T1 S2 L1  REVIEW, sections {a} + {b} -> merge      (no-org)
//   T1 S2 L2  REVIEW, sections NULL                    (no-org)
//   T1 S2 L2  REVIEW, sections NULL                    (via ORG -> org-keyed row)
//   T1 S2 L1  ASSIGN                                   (no-org)
//   T2        (nothing -- existing rows there are stale)
// V mirrors enough REVIEW permissions that every V row seeded below is exactly
// what regeneration would produce, making the legacy path a no-op for V.
export const SEED_SQL = `
INSERT INTO public.organisation (id, name)
  VALUES (${ORG}, 'TEST_RRA Org');

INSERT INTO public."user" (id, first_name, last_name, username, email)
  VALUES (${USER_U}, 'Test', 'RraUserU', 'testRraUserU', 'test-rra-u@example.com'),
         (${USER_V}, 'Test', 'RraUserV', 'testRraUserV', 'test-rra-v@example.com');

INSERT INTO public.template (id, name, code, status, version_id)
  VALUES (${T1}, 'Test RRA Template 1', 'TEST_RRA_1', 'AVAILABLE', 'testRra1'),
         (${T2}, 'Test RRA Template 2', 'TEST_RRA_2', 'AVAILABLE', 'testRra2');

INSERT INTO public.template_stage (id, number, title, template_id)
  VALUES (${T1_STAGE_1}, 1, 'Stage 1', ${T1}),
         (${T1_STAGE_2}, 2, 'Stage 2', ${T1}),
         (${T2_STAGE_1}, 1, 'Stage 1', ${T2});

INSERT INTO public.template_stage_review_level (id, stage_id, number, name)
  VALUES (${LEVEL_T1_S1_L1}, ${T1_STAGE_1}, 1, 'Review'),
         (${LEVEL_T1_S2_L1}, ${T1_STAGE_2}, 1, 'Review'),
         (${LEVEL_T1_S2_L2}, ${T1_STAGE_2}, 2, 'Consolidation'),
         (${LEVEL_T2_S1_L1}, ${T2_STAGE_1}, 1, 'Review');

INSERT INTO public.template_section (id, template_id, title, code, index)
  VALUES (90001, ${T1}, 'Section A', 'a', 0),
         (90002, ${T1}, 'Section B', 'b', 1),
         (90003, ${T2}, 'Section A', 'a', 0);

INSERT INTO public.permission_policy (id, name, type)
  VALUES (90001, 'testRraReviewPolicy', 'REVIEW'),
         (90002, 'testRraAssignPolicy', 'ASSIGN');

INSERT INTO public.permission_name (id, name, permission_policy_id)
  VALUES (90001, 'testRraReviewS1', 90001),
         (90002, 'testRraReviewS2L1ab', 90001),
         (90003, 'testRraReviewS2L1null', 90001),
         (90004, 'testRraReviewS2L2', 90001),
         (90005, 'testRraAssignS2L1', 90002),
         (90006, 'testRraReviewT2', 90001),
         (90007, 'testRraReviewS2L2org', 90001);

INSERT INTO public.template_permission
    (id, permission_name_id, template_id, allowed_sections, stage_number, level_number)
  VALUES (90001, 90001, ${T1}, NULL, 1, 1),
         (90002, 90002, ${T1}, '{a}', 2, 1),
         (90003, 90002, ${T1}, '{b}', 2, 1),
         (90004, 90003, ${T1}, NULL, 2, 1),
         (90005, 90004, ${T1}, NULL, 2, 2),
         (90006, 90005, ${T1}, NULL, 2, 1),
         (90007, 90006, ${T2}, NULL, 1, 1),
         (90008, 90007, ${T1}, NULL, 2, 2);

INSERT INTO public.permission_join (id, user_id, organisation_id, permission_name_id)
  VALUES (90001, ${USER_U}, NULL, 90001),
         (90002, ${USER_U}, NULL, 90002),
         (90003, ${USER_U}, ${ORG}, 90007),
         (90004, ${USER_U}, NULL, 90004),
         (90005, ${USER_U}, NULL, 90005),
         (90011, ${USER_V}, NULL, 90001),
         (90013, ${USER_V}, NULL, 90003),
         (90014, ${USER_V}, NULL, 90004),
         (90016, ${USER_V}, NULL, 90006);

INSERT INTO public.application (id, template_id, user_id, serial, name, outcome, is_active)
  VALUES (${APP_GRANT}, ${T1}, ${USER_V}, 'TEST-RRA-90001', 'Test RRA grant', 'PENDING', TRUE),
         (${APP_FIRST_DRAFT}, ${T1}, ${USER_V}, 'TEST-RRA-90002', 'Test RRA first draft', 'PENDING', TRUE),
         (${APP_APPROVED}, ${T1}, ${USER_V}, 'TEST-RRA-90003', 'Test RRA approved', 'APPROVED', FALSE),
         (${APP_ASSIGNED}, ${T1}, ${USER_V}, 'TEST-RRA-90004', 'Test RRA assigned', 'PENDING', TRUE),
         (${APP_DRAFT_LATER}, ${T1}, ${USER_V}, 'TEST-RRA-90005', 'Test RRA changes required', 'PENDING', TRUE),
         (${APP_TWO_LEVELS}, ${T1}, ${USER_V}, 'TEST-RRA-90006', 'Test RRA two levels', 'PENDING', TRUE),
         (${APP_REVOKED}, ${T2}, ${USER_V}, 'TEST-RRA-90007', 'Test RRA revoked', 'PENDING', TRUE);

-- Non-current stage rows first; inserting a row with is_current TRUE
-- auto-deactivates all others for the application (DB trigger)
INSERT INTO public.application_stage_history (id, application_id, stage_id, time_created, is_current)
  VALUES (90004, ${APP_ASSIGNED}, ${T1_STAGE_1}, '${OLD_TS}', FALSE),
         (90007, ${APP_TWO_LEVELS}, ${T1_STAGE_1}, '${OLD_TS}', FALSE),
         (90001, ${APP_GRANT}, ${T1_STAGE_1}, '${T0}', TRUE),
         (90002, ${APP_FIRST_DRAFT}, ${T1_STAGE_1}, '${T0}', TRUE),
         (90003, ${APP_APPROVED}, ${T1_STAGE_1}, '${T0}', TRUE),
         (90005, ${APP_ASSIGNED}, ${T1_STAGE_2}, '${T0}', TRUE),
         (90006, ${APP_DRAFT_LATER}, ${T1_STAGE_1}, '${T0}', TRUE),
         (90008, ${APP_TWO_LEVELS}, ${T1_STAGE_2}, '${T0}', TRUE),
         (90009, ${APP_REVOKED}, ${T2_STAGE_1}, '${T0}', TRUE);

INSERT INTO public.application_status_history (id, application_stage_history_id, status, time_created, is_current)
  VALUES (90001, 90001, 'SUBMITTED', '${T0}', TRUE),
         (90002, 90002, 'DRAFT', '${T0}', TRUE),
         (90003, 90003, 'COMPLETED', '${T0}', TRUE),
         (90004, 90005, 'SUBMITTED', '${T0}', TRUE),
         (90005, 90006, 'DRAFT', '${T0}', TRUE),
         (90006, 90008, 'SUBMITTED', '${T0}', TRUE),
         (90007, 90009, 'SUBMITTED', '${T0}', TRUE);

-- level_id and template_id are filled by DB triggers.
-- V rows are seeded exactly as regeneration would produce them.
INSERT INTO public.review_assignment
    (id, reviewer_id, organisation_id, stage_id, stage_number, time_stage_created, status,
     application_id, allowed_sections, assigned_sections, level_number,
     is_last_level, is_last_stage, is_final_decision, is_self_assignable)
  VALUES
    (90001, ${USER_V}, NULL, ${T1_STAGE_1}, 1, '${T0}', 'AVAILABLE', ${APP_GRANT}, NULL, '{}', 1, TRUE, FALSE, FALSE, FALSE),
    (90002, ${USER_U}, NULL, ${T1_STAGE_1}, 1, '${T0}', 'AVAILABLE', ${APP_APPROVED}, '{a}', '{}', 1, TRUE, FALSE, FALSE, FALSE),
    (90003, ${USER_V}, NULL, ${T1_STAGE_1}, 1, '${T0}', 'AVAILABLE', ${APP_APPROVED}, NULL, '{}', 1, TRUE, FALSE, FALSE, FALSE),
    (90004, ${USER_U}, NULL, ${T1_STAGE_2}, 2, '${T0}', 'ASSIGNED', ${APP_ASSIGNED}, '{a}', '{a}', 1, FALSE, TRUE, FALSE, FALSE),
    (90005, ${USER_V}, NULL, ${T1_STAGE_2}, 2, '${T0}', 'AVAILABLE', ${APP_ASSIGNED}, NULL, '{}', 1, FALSE, TRUE, FALSE, FALSE),
    (90006, ${USER_V}, NULL, ${T1_STAGE_1}, 1, '${T0}', 'AVAILABLE', ${APP_DRAFT_LATER}, NULL, '{}', 1, TRUE, FALSE, FALSE, FALSE),
    (90007, ${USER_V}, NULL, ${T1_STAGE_2}, 2, '${T0}', 'AVAILABLE', ${APP_TWO_LEVELS}, NULL, '{}', 1, FALSE, TRUE, FALSE, FALSE),
    (90008, ${USER_V}, NULL, ${T1_STAGE_2}, 2, '${T0}', 'AVAILABLE', ${APP_TWO_LEVELS}, NULL, '{}', 2, TRUE, TRUE, FALSE, TRUE),
    (90009, ${USER_U}, NULL, ${T2_STAGE_1}, 1, '${T0}', 'ASSIGNED', ${APP_REVOKED}, NULL, '{a}', 1, TRUE, TRUE, FALSE, FALSE),
    (90010, ${USER_V}, NULL, ${T2_STAGE_1}, 1, '${T0}', 'AVAILABLE', ${APP_REVOKED}, NULL, '{}', 1, TRUE, TRUE, FALSE, FALSE);

-- Review on U's stale assignment; deleting the assignment must cascade here
INSERT INTO public.review (id, review_assignment_id)
  VALUES (${REVIEW_ON_REVOKED}, 90009);
`

// ----- New-behaviour (gated) suite ids --------------------------------------

export const NB_USER_U = 90101
export const NB_USER_V = 90102
export const NB_ORG = 90101
export const NB_T = 90101
export const NB_STAGE = 90101
export const NB_LEVEL = 90101

export const NB_APP_STALE_JOIN = 90101 // V assignment + stale U assigner join
export const NB_APP_INCONSISTENT = 90102 // V row missing (legacy would create it)
export const NB_APP_ASSIGNED = 90103 // U ASSIGNED no-org; org perm must create AVAILABLE row

// Permission layout for NB_USER_U on NB_T stage 1 level 1:
//   REVIEW sections NULL (no-org)  + REVIEW sections {a} (no-org)  -> NULL-dominant merge
//   REVIEW sections NULL (via NB_ORG)                              -> org-keyed rows
//   no ASSIGN permission anywhere                                  -> stale join must go
export const NB_SEED_SQL = `
INSERT INTO public.organisation (id, name)
  VALUES (${NB_ORG}, 'TEST_RRA NB Org');

INSERT INTO public."user" (id, first_name, last_name, username, email)
  VALUES (${NB_USER_U}, 'Test', 'RraNbUserU', 'testRraNbUserU', 'test-rra-nb-u@example.com'),
         (${NB_USER_V}, 'Test', 'RraNbUserV', 'testRraNbUserV', 'test-rra-nb-v@example.com');

INSERT INTO public.template (id, name, code, status, version_id)
  VALUES (${NB_T}, 'Test RRA NB Template', 'TEST_RRA_NB', 'AVAILABLE', 'testRraNb');

INSERT INTO public.template_stage (id, number, title, template_id)
  VALUES (${NB_STAGE}, 1, 'Stage 1', ${NB_T});

INSERT INTO public.template_stage_review_level (id, stage_id, number, name)
  VALUES (${NB_LEVEL}, ${NB_STAGE}, 1, 'Review');

INSERT INTO public.template_section (id, template_id, title, code, index)
  VALUES (90101, ${NB_T}, 'Section A', 'a', 0),
         (90102, ${NB_T}, 'Section B', 'b', 1);

INSERT INTO public.permission_policy (id, name, type)
  VALUES (90101, 'testRraNbReviewPolicy', 'REVIEW');

INSERT INTO public.permission_name (id, name, permission_policy_id)
  VALUES (90101, 'testRraNbReviewNull', 90101),
         (90102, 'testRraNbReviewA', 90101),
         (90103, 'testRraNbReviewV', 90101),
         (90104, 'testRraNbReviewOrg', 90101);

INSERT INTO public.template_permission
    (id, permission_name_id, template_id, allowed_sections, stage_number, level_number)
  VALUES (90101, 90101, ${NB_T}, NULL, 1, 1),
         (90102, 90102, ${NB_T}, '{a}', 1, 1),
         (90103, 90103, ${NB_T}, NULL, 1, 1),
         (90104, 90104, ${NB_T}, NULL, 1, 1);

INSERT INTO public.permission_join (id, user_id, organisation_id, permission_name_id)
  VALUES (90101, ${NB_USER_U}, NULL, 90101),
         (90102, ${NB_USER_U}, NULL, 90102),
         (90103, ${NB_USER_V}, NULL, 90103),
         (90104, ${NB_USER_U}, ${NB_ORG}, 90104);

INSERT INTO public.application (id, template_id, user_id, serial, name, outcome, is_active)
  VALUES (${NB_APP_STALE_JOIN}, ${NB_T}, ${NB_USER_V}, 'TEST-RRA-NB-90101', 'Test RRA NB stale join', 'PENDING', TRUE),
         (${NB_APP_INCONSISTENT}, ${NB_T}, ${NB_USER_V}, 'TEST-RRA-NB-90102', 'Test RRA NB inconsistent', 'PENDING', TRUE),
         (${NB_APP_ASSIGNED}, ${NB_T}, ${NB_USER_V}, 'TEST-RRA-NB-90103', 'Test RRA NB assigned', 'PENDING', TRUE);

INSERT INTO public.application_stage_history (id, application_id, stage_id, time_created, is_current)
  VALUES (90101, ${NB_APP_STALE_JOIN}, ${NB_STAGE}, '${T0}', TRUE),
         (90102, ${NB_APP_INCONSISTENT}, ${NB_STAGE}, '${T0}', TRUE),
         (90103, ${NB_APP_ASSIGNED}, ${NB_STAGE}, '${T0}', TRUE);

INSERT INTO public.application_status_history (id, application_stage_history_id, status, time_created, is_current)
  VALUES (90101, 90101, 'SUBMITTED', '${T0}', TRUE),
         (90102, 90102, 'SUBMITTED', '${T0}', TRUE),
         (90103, 90103, 'SUBMITTED', '${T0}', TRUE);

INSERT INTO public.review_assignment
    (id, reviewer_id, organisation_id, stage_id, stage_number, time_stage_created, status,
     application_id, allowed_sections, assigned_sections, level_number,
     is_last_level, is_last_stage, is_final_decision, is_self_assignable)
  VALUES
    (90101, ${NB_USER_V}, NULL, ${NB_STAGE}, 1, '${T0}', 'AVAILABLE', ${NB_APP_STALE_JOIN}, NULL, '{}', 1, TRUE, TRUE, FALSE, FALSE),
    (90102, ${NB_USER_U}, NULL, ${NB_STAGE}, 1, '${T0}', 'ASSIGNED', ${NB_APP_ASSIGNED}, NULL, '{a}', 1, TRUE, TRUE, FALSE, FALSE),
    (90103, ${NB_USER_V}, NULL, ${NB_STAGE}, 1, '${T0}', 'AVAILABLE', ${NB_APP_ASSIGNED}, NULL, '{}', 1, TRUE, TRUE, FALSE, FALSE);

-- Stale assigner join: U is not an assigner anywhere, so this must be deleted
INSERT INTO public.review_assignment_assigner_join (id, assigner_id, organisation_id, review_assignment_id)
  VALUES (90101, ${NB_USER_U}, NULL, 90101);
`
