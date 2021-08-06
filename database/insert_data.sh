#!/bin/bash

#copy folder with snapshot_basic for inital Application manager setup
cp -rf ./database/snapshot_basic ./database/_snapshots

#update submodule with existing templates
echo -e "\nUpdating snapshots folder with lastest application-manager-templates main"
git submodule update --init 

#insert data from
echo -e "\nInserting data..."

echo $1
if [ $1 != '' ]
then 
    yarn ts-node ./database/snapshotCLI.ts use $1 &
else 
    yarn ts-node ./database/snapshotCLI.ts use "snapshot_basic" &
fi

# yarn ts-node ./database/insertDataCLI.ts $1 &

# Makes script wait until async node script has completed
PID=$!
wait $PID

yarn ts-node ./database/updateRowPoliciesCLI.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
