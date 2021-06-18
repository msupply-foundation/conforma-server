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
  '//': 'Folder path from perspective of server.ts/js',
  filesFolder: '../files',
  pluginsFolder: '../plugins',
  imagesFolder: '../images',
  databaseFolder: '../database',
  jwtSecret: 'devsecret',
  RESTport: 8080,
  thumbnailMaxWidth: 300,
  thumbnailMaxHeight: 300,
}

export default config
