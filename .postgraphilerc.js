module.exports = {
  dynamicJson: true,
  options: {
    appendPlugins: [
      '@graphile-contrib/pg-simplify-inflector',
      'postgraphile-plugin-nested-mutations',
      'postgraphile-plugin-connection-filter',
    ],
    graphiql: '/graphiql',
    enhanceGraphiql: true,
    cors: true,
    watch: true,
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  },
}
