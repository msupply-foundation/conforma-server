#!/bin/bash

echo '--- STARTING POSTGRES'
service postgresql start

cd /usr/src/application-manager-server

echo '--- ADDING SCHEMA'
gosu postgres ./database/initialise_database.sh

echo '--- STARTING SERVER'
node ./build/src/server.js &
echo '--- STARTING POST-GRAPHILE (graphQL)'
yarn postgraphile -c "postgres://postgres@localhost/tmf_app_manager" --watch --disable-query-log &
sleep 3

echo '--- ADDING DATA'
./database/insert_data.sh
