#!/bin/bash

echo '--- STARTING POSTGRES'
service postgresql start

cd /usr/src/conforma-server

echo '--- ADDING SCHEMA'
./database/initialise_database.sh tmf_app_manager

echo '--- ADDING DATA'
./database/insert_data.sh $1

# Loading a snapshot from here puts these folders in the repo root rather than
# the "build" folder so, need to move them in:
rm -r -f build/files
rm -r -f build/preferences
rm -r -f build/localisation
mv files build
mv preferences build
mv localisation build

# Stop Postgres first so fresh_db is a clean, consistent copy of the cluster
# (a hot copy would force WAL recovery when it's later seeded into a volume).
echo '--- STOPPING POSTGRES for a clean fresh_db copy'
service postgresql stop
sleep 2

# Clean copy of the initialised cluster, kept at an unshadowed path so entry.sh
# can seed it into the Postgres data volume on first launch (when that volume
# mounts empty). See docker/entry.sh.
echo '--- COPY CLEAN DATABASE (used to seed an empty DB volume on first launch)'
cp -R /var/lib/postgresql/16/main/ ./fresh_db

# Empty the image's data dir so Docker's implicit named-volume seeding brings
# nothing, making entry.sh's fresh_db restore the single, deterministic DB-seed
# path (covers both compose volumes and the no-volume run.sh case).
echo '--- EMPTYING image data dir (entry.sh seeds it from fresh_db at launch)'
find /var/lib/postgresql/16/main -mindepth 1 -delete
