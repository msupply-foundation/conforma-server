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
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { replaceForeignKeyRef } from './updateHashes'

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
}

type LinkedEntityInput = {
  checksum: string | null
  last_modified: Date | null
}

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

  const linkedEntities: FullLinkedEntities = {
    filters: buildLinkedEntityObject(linkedFilters, 'code'),
    permissions: buildLinkedEntityObject(linkedPermissions, 'name'),
    dataViews: buildLinkedEntityObject(linkedDataViews, 'identifier'),
    dataViewColumns: buildLinkedEntityObject(linkedDataViewColumns, ['table_name', 'column_name']),
    category: buildLinkedEntityObject([linkedCategory], 'code')[linkedCategory.code],
  }

  return linkedEntities
}

const stripIds = <T>(data: T): Omit<T, 'id'> =>
  filterObject(data as { [key: string]: any }, (key) => key !== 'id') as Omit<T, 'id'>

const buildLinkedEntityObject = <T extends LinkedEntityInput>(
  entities: T[],
  keyField: keyof T | (keyof T)[]
): LinkedEntities => {
  return entities.reduce((acc, entity) => {
    const key = String(
      Array.isArray(keyField) ? keyField.map((kf) => entity[kf]).join('__') : entity[keyField]
    )

    const { checksum, last_modified, ...data } = entity

    if (last_modified === null || checksum === null)
      throw new ApiError('Some linked entities have missing checksums/dates', 500)

    return { ...acc, [key]: { checksum, lastModified: last_modified, data } }
  }, {})
}
