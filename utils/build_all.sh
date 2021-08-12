#!/bin/bash
set -e
echo 'removing build folder'
rm -rf ./build
echo 'building app with tsc'
tsc
echo 'copying images'
cp -R images ./build/
echo 'copying database related files'
cp -R database/buildSchema ./build/database/
cp -R database/insertData ./build/database/
cp -R database/snapshotOptions ./build/database/
cp -R database/_snapshots ./build/database/
#cp -R database/snapshotScripts/*.html ./build/database/snapshotScripts
cp -R database/*.sh build/database
cp -R database/*.sql build/database
echo 'building plugins'
node ./utils/pluginScripts/buildPlugins.js
