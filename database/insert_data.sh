#!/bin/bash
#insert data from
echo -e "\nInserting data..."

node ./database/insertData.js --from_insert_data.sh $1 &

# Makes script wait until async node script has completed
PID=$!
wait $PID

# Turn on Row-level Security
echo -e "\nEnabling Row-level Security..."
psql -U postgres -q -b -d tmf_app_manager -f "./database/turn_on_row_level_security.sql"

node ./database/updateRowPolicies.js --from_insert_data.sh &

# Makes script wait until async node script has completed
PID=$!
wait $PID
