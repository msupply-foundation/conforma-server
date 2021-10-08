#!/bin/bash

#copy folder with snapshot_basic for inital Application manager setup
mkdir ./database/_snapshots
cp -rf ./database/core_templates ./database/_snapshots

#insert data from
echo -e "\nInserting data..."

echo $1

if [ $1 = 'js' ]; then
    yarn ts-node ./database/insertDataCLI.ts $2 &
elif [ $1 != '' ]; then
    yarn ts-node ./database/snapshotCLI.ts use $1 &
else
    yarn ts-node ./database/snapshotCLI.ts use "core_templates" &
fi

# Makes script wait until async node script has completed
PID=$!
wait $PID
