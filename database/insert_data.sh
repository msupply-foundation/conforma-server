#!/bin/bash
#insert data from 
echo "\nInserting data..."

node ./database/insertData.js --from_insert_data.sh &

# Makes script wait until async node script has completed
PID=$!
wait $PID

node ./database/updateRowPolicies.js --from_insert_data.sh &

# Makes script wait until async node script has completed
PID=$!
wait $PID