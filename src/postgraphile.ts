/**
 * https://www.graphile.org/postgraphile/usage-library/
 */

require('dotenv').config()
import { FastifyReply, FastifyRequest } from 'fastify'
import { postgraphile, PostGraphileResponseFastify3, PostGraphileResponse } from 'postgraphile'

const isProductionBuild = process.env.NODE_ENV === 'production'

export const pgMiddleware = postgraphile(
  'postgres://postgres@localhost/tmf_app_manager',
  'public',
  {
    watchPg: true,
    appendPlugins: [
      require('@graphile-contrib/pg-simplify-inflector'),
      require('postgraphile-plugin-nested-mutations'),
      require('postgraphile-plugin-connection-filter'),
      require('postgraphile/plugins').TagsFilePlugin,
    ],
    pgDefaultRole: 'graphile_user',
    graphiql: true,
    enhanceGraphiql: true,
    externalUrlBase: isProductionBuild ? '/server' : '',
    dynamicJson: true,
    jwtSecret: process.env.JWT_SECRET || 'devsecret',
    disableQueryLog: isProductionBuild || process.env.HIDE_GRAPHQL_QUERY_LOG === 'true',
    graphileBuildOptions: {
      connectionFilterRelations: true,
      connectionFilterAllowEmptyObjectInput: true,
    },
    allowExplain: !isProductionBuild,
    bodySizeLimit: '500kb',
  }
)

/**
 * Converts a PostGraphile route handler into a Fastify request handler.
 */
export const convertHandler =
  (handler: (res: PostGraphileResponse) => Promise<void>) =>
  (request: FastifyRequest, reply: FastifyReply) =>
    handler(new PostGraphileResponseFastify3(request, reply))
