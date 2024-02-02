#!/bin/bash

# Script to stop a docker-compose container.
# Pass the instances (corresponding to .env files) as args e.g
# ./stop.sh 50000 50002

DEFAULT_INSTANCE=50000 #Set this for specific server, or leave blank

cd "$(dirname "$0")"

if [ "$#" -eq 0 ]; then
    if [ -z "$DEFAULT_INSTANCE" ]; then
        echo -e "No instances specified and no default instance...exiting."
        exit 0
    fi
    echo "No instances specified, will attempt to stop default: $DEFAULT_INSTANCE"
    ARGS=($DEFAULT_INSTANCE)
else
    ARGS=("$@")
fi

for instance in "${ARGS[@]}"; do
    ENV_FILE=env_files/$instance.env
    if ! [[ -f $ENV_FILE ]]; then
        echo "Can't find $ENV_FILE... skipping $instance"
        break
    fi
    source $ENV_FILE
    NAME=conforma-on-$PORT #from .env file

    # Stop specific instance
    echo -e "\nStopping $NAME..."
    sudo -E docker compose --project-name $NAME down
done
