#!/bin/bash
# This checks if database exists and creates it if not
set -e
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'tmf_app_manager'" | grep -q 1 || (psql -U postgres -c "CREATE DATABASE tmf_app_manager" && echo "\nCreating database: tmf_app_manager...")

# Delete uploaded files
rm -rf ./src/files/* 

echo "\nBuilding schema..."

psql -U postgres -q -b -d tmf_app_manager -f "./database/create_schema.sql" >&/dev/null #suppress output for this command

for file in ./database/buildSchema/*; do
    echo "  -- ${file##*/}"
    psql -v ON_ERROR_STOP=1 -U postgres -q -d tmf_app_manager -f $file 
done

sleep 1
