import { loadActions } from './actions'
import { triggerScheduledActions } from './scheduler'
import registerPlugins from './registerPlugins'
import { ActionLibrary } from '../types'
import { resumeTriggerProcessing } from './actions/resumeProcessing'

// Load action plugins
export const actionLibrary: ActionLibrary = {}
export const actionSchedule: any[] = []

export const loadActionPlugins = async () => {
  // Scan plugins folder and update Database
  await registerPlugins()
  // Load Action functions into global scope
  await loadActions(actionLibrary)
  // Finish processing triggers that were throttle-queued when server last
  // stopped
  await resumeTriggerProcessing()
  // Launch any overdue scheduled actions
  await triggerScheduledActions()
}
