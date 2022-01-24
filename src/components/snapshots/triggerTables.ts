// Keep this list up to date!

// A list of tables whose triggers should be suppressed during snapshot data
// insert, so they don't create extraneous records in the activity_log.
// Consult 45_activity_log.sql to see which tables are affected.

export const triggerTables = [
  'application',
  'application_stage_history',
  'application_status_history',
  'review_assignment',
  'review_status_history',
  'review_decision',
  'permission_join',
]
