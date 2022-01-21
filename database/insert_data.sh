#!/bin/bash

#copy folder with snapshot_basic for inital Application manager setup
mkdir ./database/_snapshots
cp -rf ./database/core_templates ./database/_snapshots

#insert data from
echo -e "\nInserting data..."

# Prevent triggers from running while we insert data
psql -U postgres -d tmf_app_manager -c "ALTER TABLE application DISABLE TRIGGER ALL"

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

# Re-enable triggers
echo -e "\Enabling triggers..."
psql -U postgres -d tmf_app_manager -c "ALTER TABLE application ENABLE TRIGGER ALL"

yarn ts-node ./database/updateRowPoliciesCLI.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
