import {
  Template as PgTemplate,
  TemplateSection as PgTemplateSection,
  TemplateElement as PgTemplateElement,
  TemplateStageReviewLevel as PgTemplateStageReviewLevel,
  TemplateStage as PgTemplateStage,
  TemplateAction as PgTemplateAction,
  File as PgFile,
  TemplateCategory as PgTemplateCategory,
} from '../../generated/postgres'

export interface LinkedEntity {
  checksum: string
  lastModified: Date
  data: LinkedEntityData
}

export type LinkedEntities = Record<string, LinkedEntity>

export interface FullLinkedEntities {
  filters: LinkedEntities
  permissions: LinkedEntities
  dataViews: LinkedEntities
  dataViewColumns: LinkedEntities
  category: LinkedEntity
  dataTables: LinkedEntities
}

export type LinkedEntityInput = {
  checksum: string | null
  last_modified: Date | null
}

export type LinkedEntityNoId = Omit<LinkedEntityInput, 'id'>
export type LinkedEntityData = Omit<LinkedEntityNoId, 'checksum' | 'last_modified'>

export type TemplateStructure = Omit<
  PgTemplate,
  'id' | 'template_category_id' | 'linked_entity_data'
> & {
  sections: TemplateSection[]
  stages: TemplateStage[]
  actions: TemplateAction[]
  files: TemplateFile[]
  shared: FullLinkedEntities
}

export type TemplateCategory = Omit<PgTemplateCategory, 'id'>

export type TemplateSection = Omit<PgTemplateSection, 'id' | 'template_id'> & {
  elements: TemplateElement[]
}

export type TemplateElement = Omit<
  PgTemplateElement,
  'id' | 'section_id' | 'template_code' | 'template_version'
>

export type TemplateStage = Omit<PgTemplateStage, 'id' | 'template_id'> & {
  review_levels: TemplateStageReviewLevel[]
}

export type TemplateStageReviewLevel = Omit<PgTemplateStageReviewLevel, 'id' | 'stage_id'>

export type TemplateAction = Omit<PgTemplateAction, 'id' | 'template_id'>

export type TemplateFile = Omit<PgFile, 'id' | 'template_id'>
