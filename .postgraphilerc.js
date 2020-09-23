module.exports = {
  options: {
    appendPlugins: [
      '@graphile-contrib/pg-simplify-inflector',
      'postgraphile-plugin-nested-mutations',
      'postgraphile-plugin-connection-filter',
    ],
    watch: true,
    graphileBuildOptions: {
      connectionFilterRelations: true,
    },
  },
}
