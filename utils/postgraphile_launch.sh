#TO-DO: Replace string with variable for DB name

npx postgraphile -c "postgres://postgres@localhost/tmf_app_manager" -C postgres --watch --enhance-graphiql --dynamic-json --cors --export-schema-graphql "database/schema.graphql" --append-plugins postgraphile-plugin-nested-mutations,@graphile-contrib/pg-simplify-inflector
