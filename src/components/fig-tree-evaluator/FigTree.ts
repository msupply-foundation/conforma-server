import { FigTreeEvaluator, SQLNodePostgres } from 'fig-tree-evaluator'
import fetch from 'node-fetch'
import functions from './functions'
import { getAdminJWT } from '../permissions/loginHelpers'
import { Client } from 'pg'
import PostgresConfig from '../database/postgresConfig.json'
import config from '../../config'

const FigTree = new FigTreeEvaluator({
  httpClient: fetch,
  sqlConnection: SQLNodePostgres(new Client(PostgresConfig)),
  graphQLConnection: { endpoint: config.graphQLendpoint },
  maxCacheSize: 100,
  maxCacheTime: 600,
  evaluateFullObject: true,
  // baseEndpoint:
  functions,
  // TO-DO: Load Fragments
})

getAdminJWT().then((result) =>
  FigTree.updateOptions({
    headers: {
      Authorization: `Bearer ${result}`,
    },
  })
)

export default FigTree
