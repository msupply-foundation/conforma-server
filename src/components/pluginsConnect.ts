import { loadActions, triggerScheduledActions } from './actions/triggersAndActions'
import registerPlugins from './registerPlugins'
import { ActionLibrary } from '../types'

// Load action plugins
export const actionLibrary: ActionLibrary = {}
export const actionSchedule: any[] = []

export const loadActionPlugins = async () => {
  // Scan plugins folder and update Database
  await registerPlugins()
  // Load Action functions into global scope
  await loadActions(actionLibrary)
  // Launch any overdue scheduled actions
  await triggerScheduledActions()
}
