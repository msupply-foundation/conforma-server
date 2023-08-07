import { FigTreeOptions } from 'fig-tree-evaluator'
import functions from './customFunctions'
import fragments from './fragments'
import { Client } from 'pg'
import config from '../../config'
import { getAdminJWT } from '../permissions/loginHelpers'

export const figTreeOptions: FigTreeOptions = {
  functions,
  fragments,
  pgConnection: new Client(config.pg_database_connection),
  graphQLConnection: { endpoint: config.graphQLendpoint },
  nullEqualsUndefined: true,
}

getAdminJWT().then((token) => (figTreeOptions.headers = { Authorization: `Bearer ${token}` }))
