import db from './databaseMethods'
import { DataView as PgDataView } from '../../generated/postgres'
import { filterObject } from '../utilityFunctions'
import { DataView } from '../../generated/graphql'

interface DataViewDetails {
  data: PgDataView
  applicantAccessible: boolean
  suggested: boolean
}

const returnColumns = [
  'id',
  'table_name',
  'title',
  'code',
  // 'permission_names',
  'priority',
  'identifier',
] as const

type PgDataViewField = (typeof returnColumns)[number]

export const getDataViewDetails = async (templateId: number) => {
  const allDataViews = await db.getAllDataViews()

  const permissions = await db.getApplyPermissionsForTemplate(templateId)
  const applicantAccessibleDataViews = await db.getAllAccessibleDataViews(permissions)
  const accessibleIdentifiers = applicantAccessibleDataViews.map(({ identifier }) => identifier)

  const distinctCodes = new Set(applicantAccessibleDataViews.map((dv) => dv.code))
  const dataViewCodesUsed: string[] = []
  for (const code of distinctCodes) {
    const elementCount = await db.getTemplateElementCountUsingDataView(templateId, code)
    if (elementCount > 0) dataViewCodesUsed.push(code)
  }

  const fullData = allDataViews.map((data) => {
    const applicantAccessible = accessibleIdentifiers.includes(data.identifier)
    const { table_name, ...rest } = filterObject(data, (key) =>
      returnColumns.includes(key as PgDataViewField)
    )
    return {
      data: { tableName: table_name, ...rest } as DataView,
      applicantAccessible,
      suggested: applicantAccessible && dataViewCodesUsed.includes(data.code),
    }
  })
  return fullData
}

export const getSuggestedDataViews = async (templateId: number) =>
  (await getDataViewDetails(templateId)).filter((dv) => dv.suggested).map(({ data }) => data)
