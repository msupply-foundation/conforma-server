#!/bin/bash

#copy folder with snapshot_basic for inital Application manager setup
mkdir ./database/_snapshots
cp -rf ./database/core_templates ./database/_snapshots

#insert data from
echo -e "\nInserting data..."

SNAPSHOT_NAME=${1:-core_templates}

echo $SNAPSHOT_NAME

if [ $SNAPSHOT_NAME = 'js' ]; then
    yarn ts-node ./database/insertDataCLI.ts $2 &
else
    yarn ts-node ./database/snapshotCLI.ts use $SNAPSHOT_NAME &
fi

# Makes script wait until async node script has completed
PID=$!
wait $PID

yarn ts-node ./database/updateRowPoliciesCLI.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
