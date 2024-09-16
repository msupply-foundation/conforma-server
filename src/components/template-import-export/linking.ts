import { DataView as PgDataView } from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'

export const getSuggestedDataViews = async (templateId: number) => {
  const dataViews = await db.getAllDataViews()

  const distinctCodes = new Set(dataViews.map((dv) => dv.code))

  const dataViewCodesUsed: string[] = []
  for (const code of distinctCodes) {
    const elementCount = await db.getTemplateElementCountUsingDataView(templateId, code)
    if (elementCount > 0) dataViewCodesUsed.push(code)
  }

  return dataViews.filter((dv) => dataViewCodesUsed.includes(dv.code))
}

export const getAllAvailableLinks = async (templateId: number) => {
  return {}
}

export const linkEntities = async (templateId: number, data: unknown) => {
  return {}
}
