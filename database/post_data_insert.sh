# Makes script wait until async node script has completed
PID=$!
wait $PID

# Reset serial numbers
echo "\nUpdating serials..."

psql -U postgres  -Atq  -d tmf_app_manager -f './database/resetSerial.sql' -o './database/temp.sql'
psql -U postgres -d tmf_app_manager -f './database/temp.sql' >&/dev/null
rm './database/temp.sql'

echo "\nGenerating types file..."
yarn generate

# This forces server to restart
touch "./src/server.ts"
