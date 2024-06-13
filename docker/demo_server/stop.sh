#!/bin/bash

# Updated 14/06/2024

# Script to stop a docker-compose container.
# Pass the instances (corresponding to .env files) as args e.g
# ./stop.sh demo3 demo4

cd "$(dirname "$0")"

# Prefer $SITE from command args, but if not provided, look in `default.env`
if [ "$#" -eq 0 ]; then
    source default.env
    if [ -z "$SITE" ]; then
        echo -e "No sites specified in command or default set in default.env\n Please enter a site corresponding to an .env file in \"env_files\" (or Enter to exit)"
    else
        echo -e "No sites specified\nPlease enter an instance corresponding to an .env file in \"env_files\", or press Enter to accept the default: $SITE"
    fi
    read value
    if [ -z "$value" ]; then
        ARGS=($SITE)
    else
        ARGS=($value)
    fi
else
    ARGS=("$@")
fi

if [ ${#ARGS[@]} -eq 0 ]; then
    echo -e "No site specified...exiting"
    exit 0
fi

for instance in "${ARGS[@]}"; do
    ENV_FILE=env_files/$instance.env
    if ! [[ -f $ENV_FILE ]]; then
        echo "Can't find $ENV_FILE... skipping $instance"
        break
    fi
    source $ENV_FILE
    NAME=conforma-$instance-on-port-$PORT #from .env file

    # Stop specific instance
    echo -e "\nStopping $NAME..."
    sudo -E docker compose --project-name $NAME down
done
