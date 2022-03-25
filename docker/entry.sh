#!/bin/bash

if [[ ! -f /var/lib/postgresql/12/main/PG_VERSION ]]; then
   echo '---'
   echo 'copying fresh db to new mounted volume'
   echo '---'
   cp -r ./fresh_db/* /var/lib/postgresql/12/main
   chown -R postgres:postgres /var/lib/postgresql/12/*
   chmod -R 0700 /var/lib/postgresql/12/*
fi

if [[ ! -f ./build/files ]]; then
   echo '---'
   echo 'no files present, will pull from core-templates'
   echo '---'
   cp -r ./build/database/core_templates/files ./build
   cp -r ./build/database/core_templates/localisation ./build
   cp ./build/database/core_templates/preferences.json ./build
fi

echo '---'
echo '---'
echo '--- STARTING POSTGRES'
echo '---'
echo '---'
service postgresql start
service postgresql status

echo '---'
echo '---'
echo '--- STARTING NGINX'
echo '---'
echo '---'
service nginx start
service nginx status

echo '---'
echo '---'
echo '--- STARTING POST-GRAPHILE (graphQL)'
echo '---'
echo '---'
# -q and -i are needed for graphiql to work correctly (otherwise graphiql would try to resolve end points in root url)
yarn postgraphile \
   -c "postgres://postgres@localhost/tmf_app_manager" \
   --watch \
   --disable-query-log \
   -r graphile_user \
   -q '/postgraphile/graphql' \
   -i '/postgraphile/graphiql' | tee /var/log/application_manager/graphile.log &
sleep 3

echo '---'
echo '---'
echo '--- STARTING SERVER'
echo '---'
echo '---'
NODE_ENV=production node ./build/src/server.js | tee /var/log/application_manager/server.log &

echo '---'
echo '---'
echo '--- Ready to go -> http://localhost:3000'
echo '---'
echo '---'
/bin/bash
