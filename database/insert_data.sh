#!/bin/bash
#insert data from 
echo "\nInserting data..."

exec node ./database/insertData.js &

# Makes script wait until async node script has completed
PID=$!
wait $PID

exec node ./database/updateRowPolicies.js &

# Makes script wait until async node script has completed
PID=$!
wait $PID