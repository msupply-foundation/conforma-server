#!/bin/sh

echo 'removing build folder'
rm -rf ./build
echo 'building app with tsc'
tsc
echo 'copying images'
cp -R images ./build/
echo 'building plugins'
node ./utils/pluginScripts/buildPlugins.js