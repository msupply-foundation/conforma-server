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
