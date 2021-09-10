import databaseConnect from '../databaseConnect'
import { getTokenData, extractJWTfromHeader } from '../permissions/loginHelpers'
import { getDistinctObjects } from '../utilityFunctions'

const routeOutcomes = async (request: any, reply: any) => {
  const { userId, orgId } = await getTokenData(extractJWTfromHeader(request))
  const templatePermissions = await (
    await databaseConnect.getUserOrgPermissionNames(userId, orgId)
  ).map((result) => result.permissionName)
  const outcomes = await databaseConnect.getAllowedOutcomeDisplays(templatePermissions)
  const distinctOutcomes = getDistinctObjects(outcomes, 'table_name', 'conflict_priority')
  return reply.send(
    distinctOutcomes.map(({ table_name, title, code }) => ({ tableName: table_name, title, code }))
  )
}

export { routeOutcomes }
