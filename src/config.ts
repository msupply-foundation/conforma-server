import prefs from '../preferences.json'
require('dotenv').config()
const isProductionBuild = process.env.NODE_ENV === 'production'
const serverPrefs: { [key: string]: any } = prefs.server

const config: { [key: string]: any } = {
  pg_database_connection: {
    user: 'postgres',
    host: 'localhost',
    database: 'tmf_app_manager',
    password: '',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  },
  // In production postgraphile is started with -q and -i /postgraphile/...
  graphQLendpoint: isProductionBuild
    ? 'http://localhost:5000/postgraphile/graphql'
    : 'http://localhost:5000/graphql',
  // 'Folder path from perspective of server.ts/js'
  filesFolder: '../files',
  pluginsFolder: '../plugins',
  imagesFolder: '../images',
  databaseFolder: '../database',
  localisationsFolder: '../localisation',
  // In production postgraphile is started with -q and -i /postgraphile/...
  nodeModulesFolder:
    process.env.NODE_ENV === 'production' ? '../../node_modules' : '../node_modules',
  jwtSecret: process.env.JWT_SECRET,
  RESTport: 8080,
  ...serverPrefs,
}

export default config
