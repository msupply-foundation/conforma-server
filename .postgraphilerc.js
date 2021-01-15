module.exports = {
  options: {
    appendPlugins: [
      '@graphile-contrib/pg-simplify-inflector',
      'postgraphile-plugin-nested-mutations',
      'postgraphile-plugin-connection-filter',
    ],
    graphiql: '/graphiql',
    enhanceGraphiql: true,
    cors: true,
    dynamicJson: true,
    jwtSecret: 'devsecret',
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  },
}
