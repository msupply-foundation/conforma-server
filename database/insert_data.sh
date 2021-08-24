#!/bin/bash

#copy folder with snapshot_basic for inital Application manager setup
cp -rf ./database/basic_snapshot ./database/_snapshots

#insert data from
echo -e "\nInserting data..."

echo $1
if [ $1 != '' ]; then
    yarn ts-node ./database/snapshotCLI.ts use $1 &
else
    yarn ts-node ./database/snapshotCLI.ts use "basic_snapshot" &
fi

# Comment all lines above this ^ and uncomment one bellow to load from js files!
# yarn ts-node ./database/insertDataCLI.ts $1 &

# Makes script wait until async node script has completed
PID=$!
wait $PID

yarn ts-node ./database/updateRowPoliciesCLI.ts &

# Makes script wait until async node script has completed
PID=$!
wait $PID
