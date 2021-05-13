#!/bin/bash
# Makes script wait until async node script has completed
PID=$!
wait $PID

echo -e "\nGenerating types file..."
yarn generate

# This forces server to restart
touch "./src/server.ts"
