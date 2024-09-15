import path from 'path'
import fsx from 'fs-extra'
import {
  Template as PgTemplate,
  TemplateSection as PgTemplateSection,
  TemplateElement as PgTemplateElement,
  TemplateStageReviewLevel as PgTemplateStageReviewLevel,
  TemplateStage as PgTemplateStage,
  TemplateAction as PgTemplateAction,
  File as PgFile,
} from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { getDiff } from './getDiff'
import { FullLinkedEntities, getTemplateLinkedEntities } from './getTemplateLinkedEntities'
import { FILES_FOLDER, TEMPLATE_TEMP_FOLDER } from '../../constants'
import { DateTime } from 'luxon'
import config from '../../config'
import archiver from 'archiver'

export const exportTemplateCheck = async (templateId: number) => {
  console.log(`Checking template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  // Fetch entity data
  const linkedEntities = await getTemplateLinkedEntities(templateId)

  return getDiff(template.linked_entity_data as FullLinkedEntities, linkedEntities)
}

type TemplateStructure = Omit<PgTemplate, 'id' | 'linked_entity_data'> & {
  sections: TemplateSection[]
  stages: TemplateStage[]
  actions: TemplateAction[]
  files: TemplateFile[]
  shared: FullLinkedEntities
}

type TemplateSection = Omit<PgTemplateSection, 'id' | 'template_id'> & {
  elements: TemplateElement[]
}

type TemplateElement = Omit<
  PgTemplateElement,
  'id' | 'section_id' | 'template_code' | 'template_version'
>

type TemplateStage = Omit<PgTemplateStage, 'id' | 'template_id'> & {
  review_levels: TemplateStageReviewLevel[]
}

type TemplateStageReviewLevel = Omit<PgTemplateStageReviewLevel, 'id' | 'stage_id'>

type TemplateAction = Omit<PgTemplateAction, 'id' | 'template_id'>

type TemplateFile = Omit<PgFile, 'id' | 'template_id'>

export const exportTemplateDump = async (templateId: number) => {
  console.log(`Exporting template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  if (template.version_id.startsWith('*'))
    throw new ApiError(`Template ${templateId} has not been committed`, 400)

  const { id, linked_entity_data, ...structure } = template

  console.log('Building structure...')
  const templateStructure: TemplateStructure = {
    ...structure,
    sections: [],
    stages: [],
    actions: [],
    files: [],
    shared:
      linked_entity_data === null
        ? await getTemplateLinkedEntities(templateId)
        : { ...(linked_entity_data as FullLinkedEntities) },
  }

  // Template Sections
  const templateSections = await db.getRecordsByField<PgTemplateSection>(
    'template_section',
    'template_id',
    id
  )

  // - Template Elements
  for (const { id: sectionId, template_id, ...sec } of templateSections) {
    const section: TemplateSection = { ...sec, elements: [] }
    const templateElements = await db.getRecordsByField<PgTemplateElement>(
      'template_element',
      'section_id',
      sectionId
    )
    templateElements.forEach(({ id, section_id, template_code, template_version, ...element }) => {
      section.elements.push(element)
    })

    templateStructure.sections.push(section)
  }

  // Template Stages
  const templateStages = await db.getRecordsByField<PgTemplateStage>(
    'template_stage',
    'template_id',
    templateId
  )

  // - Template Stage Review Levels
  for (const { id: stageId, template_id, ...stg } of templateStages) {
    const stage: TemplateStage = { ...stg, review_levels: [] }
    const reviewLevels = await db.getRecordsByField<PgTemplateStageReviewLevel>(
      'template_stage_review_level',
      'stage_id',
      stageId
    )
    reviewLevels.forEach(({ id, stage_id, ...level }) => {
      stage.review_levels.push(level)
    })

    templateStructure.stages.push(stage)
  }

  // Template Actions
  const templateActions = await db.getRecordsByField<PgTemplateAction>(
    'template_action',
    'template_id',
    templateId
  )
  for (const { id, template_id, ...action } of templateActions) {
    templateStructure.actions.push(action)
  }

  // Files
  const files = await db.getRecordsByField<PgFile>('file', 'template_id', templateId)
  for (const { id, template_id, ...file } of files) {
    templateStructure.files.push(file)
  }

  // Now dump the data to output files
  console.log('Outputting to disk...')
  const { code, version_id, version_history } = template
  const outputName = `${code}-${version_id}_v${((version_history as unknown[]) ?? []).length + 1}`
  const fullOutputPath = path.join(TEMPLATE_TEMP_FOLDER, outputName)

  await fsx.emptyDir(fullOutputPath)
  await fsx.writeJSON(path.join(fullOutputPath, 'template.json'), templateStructure, { spaces: 2 })
  await fsx.writeJSON(
    path.join(fullOutputPath, 'info.json'),
    { timestamp: DateTime.now().toISO(), version: config.version },
    { spaces: 2 }
  )

  if (templateStructure.files.length > 0) {
    await fsx.mkdir(path.join(fullOutputPath, 'files'))
    for (const file of templateStructure.files) {
      const { file_path, archive_path } = file
      await fsx.copy(
        path.join(FILES_FOLDER, archive_path ?? '', file_path),
        path.join(fullOutputPath, 'files', file_path)
      )
    }
  }

  console.log('Zipping template...')
  const zipFilePath = path.join(FILES_FOLDER, `${outputName}.zip`)
  const output = await fsx.createWriteStream(zipFilePath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  await archive.pipe(output)
  await archive.directory(fullOutputPath, false)
  await archive.finalize()

  await fsx.remove(fullOutputPath)
  console.log('Returning zip')
  return `${outputName}.zip`
}
