#!/bin/bash

echo '--- STARTING POSTGRES'
service postgresql start

cd /usr/src/conforma-server

echo '--- ADDING SCHEMA'
./database/initialise_database.sh tmf_app_manager

echo '--- STARTING SERVER'
node ./build/src/server.js &
echo '--- STARTING POST-GRAPHILE (graphQL)'
yarn postgraphile -c "postgres://postgres@localhost/tmf_app_manager" --watch --disable-query-log &
sleep 3

echo '--- ADDING DATA'
./database/insert_data.sh $1

echo '--- RUNNING POST INSTALL'
./database/turn_on_row_level_security.sh
./database/post_data_insert.sh

echo '--- COPY CLEAN DATABASE TO BE USED IF NO VOLUMES ARE MOUNTED'
cp -R /var/lib/postgresql/12/main/ ./fresh_db

# We end up with extraneous file folders in the repo root, so delete them now
rm -r files
rm -r localisation
rm -r preferences
