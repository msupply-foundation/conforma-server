#!/bin/bash
#insert data from
echo -e "\nInserting data..."

# yarn ts-node ./database/insertDataCLI.ts $1 &
yarn ts-node ./database/snapshotCLI.ts use $1 &

# Makes script wait until async node script has completed
PID=$!
wait $PID

yarn ts-node ./database/updateRowPoliciesCLI.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
