import {
  Template as PgTemplate,
  TemplateFilterJoin as PgTemplateFilterJoin,
  TemplatePermission as PgTemplatePermission,
  TemplateDataViewJoin as PgTemplateDataViewJoin,
} from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'

import { buildTemplateStructure } from './buildTemplateStructure'

export const duplicateTemplate = async (templateId: number, newCode?: string) => {
  console.log(`Duplicating template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  if (template.version_id.startsWith('*'))
    throw new ApiError(`Current template version must be committed before duplicating`, 400)

  console.log('Building structure...')
  const templateStructure = await buildTemplateStructure(template)

  const { sections, actions, stages, files, shared, ...templateRecord } = templateStructure

  if (!newCode) {
    // Making a new version
    ;(templateRecord.version_history as Record<string, unknown>[]).push({
      timestamp: templateRecord.version_timestamp,
      versionId: templateRecord.version_id,
      parentVersionId: templateRecord.parent_version_id,
      comment: templateRecord.version_comment,
    })
  } else {
    // New template type
    templateRecord.code = newCode
    templateRecord.version_history = []
    templateRecord.name = `NEw template base from: ${template.name}`
    templateRecord.name_plural = null
  }

  templateRecord.parent_version_id = templateRecord.version_id
  templateRecord.version_comment = null
  templateRecord.version_id = '*' // TO-DO: Add suffix if this already exists

  try {
    await db.beginTransaction()

    const newTemplateId = await db.insertRecord('template', {
      ...templateRecord,
      linked_entity_data: null,
      template_category_id: template.dashboard_restrictions,
    })

    for (const section of sections) {
      const { elements, ...sectionRecord } = section
      const newSectionId = await db.insertRecord('template_section', {
        ...sectionRecord,
        template_id: newTemplateId,
      })

      for (const element of elements) {
        await db.insertRecord('template_element', { ...element, section_id: newSectionId })
      }
    }

    for (const stage of stages) {
      const { review_levels, ...stageRecord } = stage
      const newStageId = await db.insertRecord('template_stage', {
        ...stageRecord,
        template_id: newTemplateId,
      })

      for (const level of review_levels) {
        await db.insertRecord('template_stage_review_level', { ...level, stage_id: newStageId })
      }
    }

    for (const action of actions) {
      await db.insertRecord('template_action', {
        ...action,
        template_id: newTemplateId,
      })
    }

    // We don't insert new FILE records, and we don't re-link the existing one
    // until the new template is made "AVAILABLE" -- This needs re-visiting

    const filterJoins = await db.getRecordsByField<PgTemplateFilterJoin>(
      'template_filter_join',
      'template_id',
      template.id
    )
    for (const { filter_id } of filterJoins) {
      await db.insertRecord('template_filter_join', { filter_id, template_id: newTemplateId })
    }

    const templatePermissionJoins = await db.getRecordsByField<PgTemplatePermission>(
      'template_permission',
      'template_id',
      template.id
    )
    for (const { template_id, id, ...templatePermission } of templatePermissionJoins) {
      await db.insertRecord('template_permission', {
        template_id: newTemplateId,
        ...templatePermission,
      })
    }

    const dataViewJoins = await db.getRecordsByField<PgTemplateDataViewJoin>(
      'template_data_view_join',
      'template_id',
      template.id
    )
    for (const { data_view_id } of dataViewJoins) {
      await db.insertRecord('template_data_view_join', { data_view_id, template_id: newTemplateId })
    }

    await db.commitTransaction()

    return newTemplateId
  } catch (err) {
    await db.cancelTransaction()
    throw err
  }
}
