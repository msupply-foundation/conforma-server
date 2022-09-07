// Keep this list up to date!

// A list of tables whose triggers should be suppressed during snapshot data
// insert, so they don't create extraneous records in the activity_log, or other
// unwanted behaviours.

export const triggerTables = [
  'action_queue',
  'trigger_queue',
  'trigger_schedule',
  'verification',
  'application',
  'application_response',
  'application_stage_history',
  'application_status_history',
  'template',
  'review',
  'review_decision',
  'review_response',
  'review_assignment',
  'review_status_history',
  'review_decision',
  'permission_join',
  'file',
]
