#!/bin/bash
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
yarn postgraphile -c "postgres://postgres@localhost/tmf_app_manager" --watch --disable-query-log -q '/postgraphile/graphql' -i '/postgraphile/graphiql' &
sleep 3
echo '---'
echo '---'
echo '--- STARTING SERVER'
echo '---'
echo '---'
node ./build/src/server.js &

/bin/bash