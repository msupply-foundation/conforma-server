#!/bin/bash
#insert data from
echo -e "\nInserting data..."

yarn ts-node ./database/insertDataCLI.ts $1 &

# Makes script wait until async node script has completed
PID=$!
wait $PID

yarn ts-node ./database/updateRowPolicies.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
