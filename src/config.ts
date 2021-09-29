const config = {
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
  graphQLendpoint:
    process.env.NODE_ENV === 'production'
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
  jwtSecret: 'devsecret',
  RESTport: 8080,
  thumbnailMaxWidth: 300,
  thumbnailMaxHeight: 300,

  // For scheduled actions -- will run on the hour at these times:
  hoursSchedule: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  ],
}

export default config
