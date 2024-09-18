import { snakeCase } from 'lodash'
import { DataView } from '../../generated/graphql'
import {
  PermissionName as PgPermissionName,
  DataView as PgDataView,
  Filter as PgFilter,
  DataViewColumnDefinition as PgDataViewColumnDefinition,
  Template as PgTemplate,
  TemplateCategory as PgTemplateCategory,
  File as PgFile,
} from '../../generated/postgres'
import { buildColumnList } from '../data_display/helpers'
import { filterObject, isObject, objectKeysToCamelCase } from '../utilityFunctions'
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { replaceForeignKeyRef } from './updateHashes'
import { CombinedLinkedEntities, LinkedEntities, LinkedEntityInput } from './types'

export const getTemplateLinkedEntities = async (templateId: number) => {
  const template = await db.getRecord<PgTemplate>('template', templateId)

  // Get linked entities via JOIN tables
  const linkedFilters = (
    await db.getJoinedEntities<PgFilter>({
      templateId,
      table: 'filter',
      joinTable: 'template_filter_join',
    })
  ).map(stripIds)

  const linkedDataViews = (
    await db.getJoinedEntities<PgDataView>({
      templateId,
      table: 'data_view',
      joinTable: 'template_data_view_join',
    })
  ).map(stripIds)

  const linkedDataViewColumns = await getDataViewColumnsFromDataViews(linkedDataViews)

  const linkedPermissions = (
    await db.getJoinedEntities<
      Omit<PgPermissionName, 'id' | 'permission_policy_id'> & { permission_policy: object }
    >({
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
    await db.getRecord<PgTemplateCategory>('template_category', template.template_category_id ?? 0)
  )

  const linkedDataTables = await db.getLinkedDataTables(
    linkedDataViews.map((dv) => snakeCase(dv.table_name))
  )

  // const fileUidsUsedInActions = await db.getFilesFromDocAction(templateId)
  // const linkedFiles: (Omit<PgFile, 'id'> | { unique_id: string; error: string })[] = []
  // for (const fileId of fileUidsUsedInActions) {
  //   const file = await db.getRecord<PgFile>('file', fileId, 'unique_id')
  //   if (!file) {
  //     linkedFiles.push({
  //       unique_id: fileId,
  //       error: `WARNING: This template references a file that is missing from the database: ${fileId}`,
  //     })
  //     console.log(
  //       `WARNING: This template (id ${templateId}) references a file that is missing from the database: ${fileId}`
  //     )
  //     continue
  //   }
  //   const { id, ...fileRecord } = file
  //   linkedFiles.push(fileRecord)
  // }
  // linkedFiles.push(
  //   ...stripIds(
  //     (await db.getRecordsByField<PgFile>('file', 'template_id', templateId)).filter(
  //       (file) => !fileUidsUsedInActions.includes(file.unique_id)
  //     )
  //   )
  // )

  const linkedEntities: CombinedLinkedEntities = {
    filters: buildLinkedEntityObject(linkedFilters, 'code'),
    permissions: buildLinkedEntityObject(linkedPermissions, 'name'),
    dataViews: buildLinkedEntityObject(linkedDataViews, 'identifier'),
    dataViewColumns: buildLinkedEntityObject(linkedDataViewColumns, ['table_name', 'column_name']),
    category: linkedCategory
      ? buildLinkedEntityObject([linkedCategory], 'code')[linkedCategory.code]
      : null,
    dataTables: buildLinkedEntityObject(linkedDataTables, 'table_name'),
  }

  return linkedEntities
}

const stripIds = <T>(data: T): Omit<T, 'id'> => {
  if (!isObject(data)) return data
  return filterObject(data as { [key: string]: any }, (key) => key !== 'id') as Omit<T, 'id'>
}

const buildLinkedEntityObject = <T extends LinkedEntityInput>(
  entities: T[],
  keyField: keyof T | (keyof T)[]
): LinkedEntities<T> => {
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

export const getDataViewColumnsFromDataViews = async (dataViews: Omit<PgDataView, 'id'>[]) => {
  const dataViewColumns = new Set<PgDataViewColumnDefinition>()
  for (const dataView of dataViews) {
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
  return Array.from(dataViewColumns).map(stripIds)
}
