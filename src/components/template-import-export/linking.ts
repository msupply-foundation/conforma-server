import db from './databaseMethods'
import { DataView as PgDataView } from '../../generated/postgres'

interface DataViewDetails {
  data: PgDataView
  applicantAccessible: boolean
  suggested: boolean
}

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

  const fullData: DataViewDetails[] = allDataViews.map((data) => {
    const applicantAccessible = accessibleIdentifiers.includes(data.identifier)
    return {
      data,
      applicantAccessible,
      suggested: applicantAccessible && dataViewCodesUsed.includes(data.code),
    }
  })
  return fullData
}

export const getSuggestedDataViews = async (templateId: number) =>
  (await getDataViewDetails(templateId)).filter((dv) => dv.suggested).map(({ data }) => data)
