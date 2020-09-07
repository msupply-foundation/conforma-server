#TO-DO: Replace string with variable for DB name

npx postgraphile -c "postgres://postgres@localhost/irims" -C postgres --watch --enhance-graphiql --dynamic-json --cors --export-schema-graphql "database/schema.graphql" --append-plugins @graphile-contrib/pg-simplify-inflector
