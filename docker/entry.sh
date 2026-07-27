#!/bin/bash

# ---------------------------------------------------------------------------
# FIRST-LAUNCH SEEDING
#
# Under docker-compose, volumes mount over the Postgres data dir and the
# prefs/localisation/files folders. A brand-new volume comes up EMPTY (Docker's
# implicit image->volume seeding is unreliable, and never happens at all for
# bind mounts), so we explicitly seed each one from the image-baked sources the
# build left at paths that no volume shadows:
#   - the DB cluster    <- ./fresh_db                    (see database.sh)
#   - prefs/lang/files  <- build/database/core_templates
#
# Every step is guarded to only run when the target is empty, so on all later
# launches the persisted volume data is left untouched. Must run BEFORE any
# service starts (Postgres won't start against an empty data dir).
# ---------------------------------------------------------------------------
APP_DIR=/usr/src/conforma-server
PG_DATA=/var/lib/postgresql/16/main
SEED_DB=$APP_DIR/fresh_db
CORE=$APP_DIR/build/database/core_templates

echo '---'
echo '--- SEEDING EMPTY VOLUMES (first launch only)'
echo '---'

# Postgres cluster
if [ ! -s "$PG_DATA/PG_VERSION" ]; then
  if [ -d "$SEED_DB" ]; then
    echo '    - DB volume empty: restoring cluster from fresh_db'
    mkdir -p "$PG_DATA"
    cp -a "$SEED_DB/." "$PG_DATA/"
    chown -R postgres:postgres "$PG_DATA"
    chmod 700 "$PG_DATA"
  else
    echo '    - WARNING: DB volume empty and no fresh_db to seed from!'
  fi
else
  echo '    - DB already initialised: skipping'
fi

# Preferences
if [ ! -f "$APP_DIR/build/preferences/preferences.json" ]; then
  echo '    - preferences empty: seeding from core_templates'
  mkdir -p "$APP_DIR/build/preferences"
  cp -a "$CORE/preferences.json" "$APP_DIR/build/preferences/preferences.json"
fi

# Localisation
if [ ! -f "$APP_DIR/build/localisation/languages.json" ]; then
  echo '    - localisation empty: seeding from core_templates'
  mkdir -p "$APP_DIR/build/localisation"
  cp -a "$CORE/localisation/." "$APP_DIR/build/localisation/"
fi

# Files
if [ ! -d "$APP_DIR/build/files" ] || [ -z "$(ls -A "$APP_DIR/build/files" 2>/dev/null)" ]; then
  echo '    - files empty: seeding from core_templates'
  mkdir -p "$APP_DIR/build/files"
  cp -a "$CORE/files/." "$APP_DIR/build/files/"
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
echo '--- STARTING SERVER'
echo '---'
echo '---'
NODE_ENV=production node ./build/src/server.js | tee -a /var/log/conforma/server.log &

echo '---'
echo '---'
echo '--- Ready to go -> http://localhost:3000'
echo '---'
echo '---'
/bin/bash
