import { loadActions, loadScheduledActions } from './triggersAndActions'
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
  // // Schedule future actions and execute overdue ones
  await loadScheduledActions(actionLibrary, actionSchedule)
}
