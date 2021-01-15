echo "\nCreating database..."

# This checks if database exists and creates it if not
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'tmf_app_manager'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE tmf_app_manager"

echo "\nBuilding schema..."

for file in ./database/buildSchema/*; do
    echo "  -- ${file##*/}"
    psql -U postgres -q -b --output="temp.txt" -d tmf_app_manager -f $file
done

sleep 1

echo "\nInserting data..."

exec node ./database/insertData_NEW.js &

# Makes script wait until async node script has completed
PID=$!
wait $PID

echo "\nGenerating types file..."
yarn generate

# This forces server to restart
touch "./src/server.ts"
