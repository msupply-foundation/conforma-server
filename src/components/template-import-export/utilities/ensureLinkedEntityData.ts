/**
 * "Self-healing" for the template linked_entity_data field: this should be
 * saved on the template record whenever a template is committed, but there are
 * historical cases where it's missing (e.g. failed post-import update). If so,
 * we regenerate and persist it before the calling operation proceeds.
 */

import db from '../databaseMethods'
import { getTemplateLinkedEntities } from './getTemplateLinkedEntities'
import { PgTemplate } from '../types'

export const ensureLinkedEntityData = async (template: PgTemplate): Promise<PgTemplate> => {
  // Drafts are supposed to have NULL linked_entity_data; nothing to heal
  if (template.version_id.startsWith('*') || template.linked_entity_data !== null) return template

  console.log(`Regenerating missing linked_entity_data for template ${template.id}...`)
  const linked_entity_data = await getTemplateLinkedEntities(template.id)
  await db.updateRecord('template', { linked_entity_data, id: template.id })
  return { ...template, linked_entity_data }
}
