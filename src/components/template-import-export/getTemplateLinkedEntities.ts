import { DataView } from '../../generated/graphql'
import {
  PermissionName as PgPermissionName,
  DataView as PgDataView,
  Filter as PgFilter,
  DataViewColumnDefinition as PgDataViewColumnDefinition,
  Template as PgTemplate,
  TemplateCategory,
} from '../../generated/postgres'
import { buildColumnList } from '../data_display/helpers'
import { filterObject, objectKeysToCamelCase } from '../utilityFunctions'
import db from './databaseMethods'
import { replaceForeignKeyRef } from './updateHashes'

interface LinkedEntity {
  checksum: string
  lastModified: Date
  data: LinkedEntityData
}

type LinkedEntityInput =
  | PgPermissionName
  | PgPermissionName
  | PgFilter
  | PgDataView
  | PgDataViewColumnDefinition

type LinkedEntityNoId = Omit<LinkedEntityInput, 'id'>
type LinkedEntityData = Omit<LinkedEntityNoId, 'checksum' | 'last_modified'>

export const getTemplateLinkedEntities = async (templateId: number) => {
  const template = await db.getRecord<PgTemplate>('template', templateId)

  // Get linked entities via JOIN tables
  const linkedFilters = (
    await db.getLinkedEntities<PgFilter>({
      templateId,
      table: 'filter',
      joinTable: 'template_filter_join',
    })
  ).map(stripIds)

  const linkedDataViews = (
    await db.getLinkedEntities<PgDataView>({
      templateId,
      table: 'data_view',
      joinTable: 'template_data_view_join',
    })
  ).map(stripIds)

  const dataViewColumns = new Set<PgDataViewColumnDefinition>()
  for (const dataView of linkedDataViews) {
    const allColumns = await db.getDataViewColumns(dataView.table_name)
    const allColumnNames = allColumns.map((col) => col.column_name)

    ;['TABLE', 'DETAIL', 'FILTER', 'RAW'].forEach((type) => {
      const usedColumns = buildColumnList(
        objectKeysToCamelCase(dataView) as DataView,
        allColumnNames,
        type as 'TABLE' | 'DETAIL' | 'FILTER' | 'RAW'
      )
      allColumns.forEach((col) => {
        if (usedColumns.includes(col.column_name)) dataViewColumns.add(col)
      })
    })
  }

  // TO-DO: Add search columns?? (Probably)

  const linkedDataViewColumns = Array.from(dataViewColumns).map(stripIds)

  const linkedPermissions = (
    await db.getLinkedEntities<PgPermissionName>({
      templateId,
      table: 'permission_name',
      joinTable: 'template_permission',
    })
  ).map(stripIds)
  for (const permission of linkedPermissions) {
    await replaceForeignKeyRef(
      permission,
      'permission_policy',
      'permission_policy_id',
      'permission_policy'
    )
  }
  const linkedCategory = stripIds(
    await db.getRecord<TemplateCategory>('template_category', template.template_category_id ?? 0)
  )

  const linkedEntities = {
    filters: linkedFilters.map((f) => constructLinkedEntity(f)),
    permissions: linkedPermissions.map((f) => constructLinkedEntity(f)),
    dataViews: linkedDataViews.map((f) => constructLinkedEntity(f)),
    dataViewColumns: linkedDataViewColumns.map((f) => constructLinkedEntity(f)),
    categories: constructLinkedEntity(linkedCategory),
  }

  return linkedEntities
}

const stripIds = <T>(data: T): Omit<T, 'id'> =>
  filterObject(data as { [key: string]: any }, (key) => key !== 'id') as Omit<T, 'id'>

const constructLinkedEntity = (data: LinkedEntityNoId) => {
  const entity: Partial<LinkedEntity> = {
    checksum: data.checksum as string,
    lastModified: data.last_modified as Date,
  }
  const reducedData = data as LinkedEntityData & { checksum?: string; last_modified?: Date }
  delete reducedData.checksum
  delete reducedData.last_modified
  entity.data = reducedData

  return entity as LinkedEntity
}
