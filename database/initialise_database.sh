#!/bin/bash
# This checks if database exists and creates it if not
set -e
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$1'" | grep -q 1 || (psql -U postgres -c "CREATE DATABASE $1" && echo "\nCreating database: $1...")

echo "\nBuilding schema..."

psql -U postgres -q -b -d $1 -f "./database/create_schema.sql" >&/dev/null #suppress output for this command

for file in ./database/buildSchema/*; do
    echo "  -- ${file##*/}"
    psql -v ON_ERROR_STOP=1 -U postgres -q -d $1 -f $file 
done

sleep 1
