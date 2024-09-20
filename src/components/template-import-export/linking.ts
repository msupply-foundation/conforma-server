import db from './databaseMethods'

export const getSuggestedDataViews = async (templateId: number) => {
  // Gets all the dataviews someone with this template's "Apply" permissions
  // can access

  const permissions = await db.getApplyPermissionsForTemplate(templateId)
  console.log('permissions', permissions)

  const dataViews = await db.getAllAccessibleDataViews(permissions)

  const distinctCodes = new Set(dataViews.map((dv) => dv.code))

  const dataViewCodesUsed: string[] = []
  for (const code of distinctCodes) {
    const elementCount = await db.getTemplateElementCountUsingDataView(templateId, code)
    if (elementCount > 0) dataViewCodesUsed.push(code)
  }

  return dataViews.filter((dv) => dataViewCodesUsed.includes(dv.code))
}
