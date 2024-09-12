import { DataView } from '../../generated/graphql'
import { buildColumnList } from '../data_display/helpers'
import { filterObject, objectKeysToCamelCase } from '../utilityFunctions'
import db from './databaseMethods'
import { replaceForeignKeyRef } from './updateHashes'

interface LinkedEntityBase {
  checksum: string
  lastModified: Date
  [key: string]: unknown
}

interface LinkedFilter extends LinkedEntityBase {
  code: string
}

interface LinkedDataView extends LinkedEntityBase {
  identifier: string
}

interface LinkedDataViewColumn extends LinkedEntityBase {
  tableName: string
  columnName: string
}

interface LinkedCategory extends LinkedEntityBase {
  code: string
}

interface LinkedPermission extends LinkedEntityBase {
  name: string
}

interface LinkedEntities {
  filter: LinkedFilter[]
  dataView: LinkedDataView[]
  dataViewColumn: LinkedDataViewColumn[]
  category: LinkedCategory
  permission: LinkedPermission[]
}

export const getTemplateLinkedEntities = async (templateId: number) => {
  const template = await db.getRecord('template', templateId)

  // Get linked entities via JOIN tables
  const linkedFilters = (
    await db.getLinkedEntities<LinkedFilter>({
      templateId,
      table: 'filter',
      joinTable: 'template_filter_join',
    })
  ).map(stripIds)

  const linkedDataViews = (
    await db.getLinkedEntities<{ table_name: string }>({
      templateId,
      table: 'data_view',
      joinTable: 'template_data_view_join',
    })
  ).map(stripIds)

  const dataViewColumns = new Set<LinkedDataViewColumn>()
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
    await db.getLinkedEntities<LinkedPermission>({
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
      'permission_policy_id'
    )
  }
  const linkedCategory = stripIds(
    await db.getRecord('template_category', template.template_category_id)
  )

  // console.log(linkedFilters)
  // console.log(linkedDataViews)
  // console.log(linkedPermissions)
  // console.log(linkedCategory)
  // Build into LinkedEntities structure
  // Save to template table
}

const stripIds = (data: Record<string, unknown>) => filterObject(data, (key) => key !== 'id')
