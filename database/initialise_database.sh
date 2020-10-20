echo "Creating database..."

psql -U postgres -f ./database/createDatabase.sql

echo "Building schema..."

for file in ./database/buildSchema/*; do
    echo $file
    psql -U postgres -d tmf_app_manager -f $file
done

sleep 1

echo "Inserting data..."

exec node ./database/insertData.js &

PID=$!
wait $PID

echo "Generating types file..."
yarn generate
