import { Template as PgTemplate } from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { getDiff } from './getDiff'
import { FullLinkedEntities, getTemplateLinkedEntities } from './getTemplateLinkedEntities'

export const exportTemplateCheck = async (templateId: number) => {
  console.log(`Checking template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) {
    throw new ApiError(`Template ${templateId} does not exist`, 400)
  }

  // Fetch entity data
  const linkedEntities = await getTemplateLinkedEntities(templateId)

  return getDiff(linkedEntities, template.linked_entity_data as FullLinkedEntities)
}
