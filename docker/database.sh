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
./database/post_data_insert.sh

echo '--- COPY CLEAN DATABASE TO BE USED IF NO VOLUMES ARE MOUNTED'
cp -R /var/lib/postgresql/16/main/ ./fresh_db

# Loading a snapshot from here puts these folders in the repo root rather than
# the "build" folder so, need to move them in:
rm -r build/files
rm -r build/preferences
rm -r build/localisation
mv files build
mv preferences build
mv localisation build
