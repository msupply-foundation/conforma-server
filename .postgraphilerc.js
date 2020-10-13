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
    exportSchemaGraphql: './database/schema.graphql',
    exportSchemaJson: './database/schema.json',
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  },
}
