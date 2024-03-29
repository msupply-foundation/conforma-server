#!/bin/bash

#insert data from
echo -e "\nInserting data..."

SNAPSHOT_NAME=${1:-core_templates} #Fallback to core_templates if no snapshot name provided

echo $SNAPSHOT_NAME

if [ $SNAPSHOT_NAME = 'js' ]; then
    yarn ts-node ./database/insertDataCLI.ts $2 &
else
    yarn ts-node ./database/snapshotCLI.ts use $SNAPSHOT_NAME &
fi

# Makes script wait until async node script has completed
PID=$!
wait $PID

# Makes script wait until async node script has completed
PID=$!
wait $PID
