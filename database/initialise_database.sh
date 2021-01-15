echo "Creating database..."

psql -U postgres -f ./database/createDatabase.sql

echo "Building schema..."

for file in ./database/buildSchema/*; do
    echo $file
    psql -U postgres -q -d tmf_app_manager -f $file
done

sleep 1

echo "Inserting data..."

exec node ./database/insertData_NEW.js &

# Makes script wait until async node script has completed
PID=$!
wait $PID

echo "Generating types file..."
yarn generate

# This forces server to restart
touch "./src/server.ts"
