import { ApiError } from '../../../ApiError'
import db from '../databaseMethods'
import { buildTemplateStructure } from '../utilities'
import { installTemplate, PreserveExistingEntities } from './importTemplate'
import { PgTemplate } from '../types'
import { TemplateStatus } from '../../../generated/graphql'

export const duplicateTemplate = async (templateId: number, newCode?: string) => {
  console.log(`Duplicating template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  if (template.version_id.startsWith('*') && !newCode)
    throw new ApiError(`Current template version must be committed before duplicating`, 400)

  console.log('Building structure...')
  const templateStructure = await buildTemplateStructure(template)

  if (!newCode) {
    // Making a new version
    ;(templateStructure.version_history as Record<string, unknown>[]).push({
      timestamp: templateStructure.version_timestamp,
      versionId: templateStructure.version_id,
      parentVersionId: templateStructure.parent_version_id,
      comment: templateStructure.version_comment,
    })
    templateStructure.parent_version_id = templateStructure.version_id
    templateStructure.version_id = await db.getNextDraftVersionId(templateStructure.code)
  } else {
    // New template type
    const nextWouldBe = await db.getNextDraftVersionId(newCode)
    if (nextWouldBe !== '*') throw new ApiError(`Template with code ${newCode} already exists`, 400)
    templateStructure.code = newCode
    templateStructure.version_history = []
    templateStructure.name = `NEW template based from: ${template.name}`
    templateStructure.name_plural = null
    templateStructure.version_id = '*'
    templateStructure.parent_version_id = null
  }

  templateStructure.version_comment = null
  templateStructure.version_timestamp = new Date()
  templateStructure.status = TemplateStatus.Draft

  // Collect ALL the linked entity identifiers stored with the original template
  // so they don't get overwritten on install
  const preserveEntityDetails: PreserveExistingEntities = {
    filters: new Set(Object.values(templateStructure.shared.filters).map(({ data }) => data.code)),
    permissions: new Set(
      Object.values(templateStructure.shared.permissions).map(({ data }) => data.name ?? '')
    ),
    dataViews: new Set(
      Object.values(templateStructure.shared.dataViews).map(({ data }) => data.identifier)
    ),
    dataViewColumns: new Set(
      Object.values(templateStructure.shared.dataViewColumns).map(
        ({ data }) => `${data.table_name}__${data.column_name}`
      )
    ),
    category: templateStructure.shared.category?.data.code,
    files: new Set(Object.values(templateStructure.shared.files).map(({ data }) => data.unique_id)),
  }

  const newTemplateId = await installTemplate(templateStructure, preserveEntityDetails)

  return newTemplateId
}
