import { FastifyReply, FastifyRequest } from 'fastify'
import DBConnect from '../database/databaseConnect'
import { ApiError } from '../../ApiError'
import { getPermissionNamesFromJWT, getPublicTokenData } from '../permissions/loginHelpers'

/** Routes for providing and updating FigTree fragments */

// Public route, available fragments restricted by permissions
export const routeGetFragments = async (
  request: FastifyRequest<{ Querystring: { frontEnd?: 'true'; backEnd?: 'true' } }>,
  reply: FastifyReply
) => {
  const tokenData = await getPublicTokenData(request)
  const { permissionNames } = await getPermissionNamesFromJWT(tokenData)

  const { frontEnd, backEnd } = request.query

  if (!frontEnd && !backEnd)
    throw new ApiError('Either front-end or back-end must be specified', 400)

  const getFrontEnd = request.query.frontEnd === 'true'
  const getBackEnd = request.query.backEnd === 'true' && tokenData.isAdmin === true
  const getBoth = getFrontEnd && getBackEnd

  if (!getFrontEnd && !getBackEnd)
    throw new ApiError('Must have Admin permissions to access back-end Fragments', 403)

  const sqlClause = getBoth
    ? 'AND (front_end = TRUE OR back_end = TRUE)'
    : getBackEnd
    ? 'AND back_end = TRUE'
    : 'AND front_end = TRUE'

  const sqlQuery = `
      SELECT id, name,
        expression, metadata
      FROM evaluator_fragment
      WHERE (
             $1 && permission_names
             OR permission_names IS NULL
             OR cardinality(permission_names) = 0
           )
       ${sqlClause};`

  const queryResult = (
    await DBConnect.query({
      text: sqlQuery,
      values: [permissionNames],
    })
  ).rows

  const fragments = queryResult.reduce(
    (frags, { name, expression, metadata }) => ({
      ...frags,
      [name]: { ...expression, metadata: metadata ?? undefined },
    }),
    {}
  )

  return reply.send(fragments)
}
