#!/bin/bash

# Updated 30/05/2024

# Script to start (or restart) one or more containers using docker-compose
# - Provide the instances you want to launch as arguments -- each must
#   correspond to an .env file in "/env_files". Will prompt for a single
#   instance if not provided

# DEFAULT_INSTANCE=demo1 #Set this for specific server, or leave blank

cd "$(dirname "$0")"

if [ -z "$TAG" ]; then
	source tag.env
	if [ -z "$TAG" ]; then
		echo -e "The \$TAG environment variable has not been set.\nPlease enter the build tag now (or leave blank to exit):"
		read tag
		if [ -z "$tag" ]; then
			exit 0
		fi
    	export TAG=$tag
    fi
fi

if [ "$#" -eq 0 ]; then
    if [ -z "$DEFAULT_INSTANCE" ]; then
        echo -e "No instances specified and no default instance...exiting."
        exit 0
    fi
    echo -e "No instances specified.\nPlease enter an instance corresponding to an .env file in \"env_files\", or press enter to accept the default: $DEFAULT_INSTANCE"
    read value
    if [ -z "$value" ]; then
        ARGS=($DEFAULT_INSTANCE)
    else
        ARGS=($value)
    fi
else
    ARGS=("$@")
fi

echo -e "Launching Conforma build: $TAG"

for instance in "${ARGS[@]}"; do
    export ENV_FILE=env_files/$instance.env
    if ! [[ -f $ENV_FILE ]]; then
        echo "Can't find $ENV_FILE... skipping $instance"
        break
    fi
    source $ENV_FILE
    
    
	# Need to re-export these vars so they're available to the scope of the docker compose
	# command we're about to launch
	export TAG=$TAG
    export BACKUPS_FOLDER=$BACKUPS_FOLDER
    echo -e " - Backups folder: $BACKUPS_FOLDER"
    export SNAPSHOTS_FOLDER=$SNAPSHOTS_FOLDER
    echo -e " - Snapshots folder: $SNAPSHOTS_FOLDER"  
    export PORT_APP=$PORT #from .env file
    echo -e " - Conforma exposed on Port: $PORT_APP" 
    export PORT_DASH=$((PORT_APP + 1))
    echo -e " - Dashboard exposed on Port: $PORT_DASH" 
    export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 64)}
    
	# Enable to test env values without launching
    # echo $JWT_SECRET
    # exit 0

    if [ -z "$PORT_APP" ]; then
        echo "Can't find \$PORT value... skipping $instance"
        break
    fi

    NAME=conforma-on-$PORT_APP
    

    # Stop current instance (if running)
    echo -e "\n(Re-)starting $NAME..."
    sudo -E docker compose --project-name $NAME down

    # Restart using new image tag
    sudo -E docker compose -f docker-compose.yml --project-name $NAME up -d
done
