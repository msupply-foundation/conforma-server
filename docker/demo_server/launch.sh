#!/bin/bash

# Updated 03/07/2024

# Script to start (or restart) one or more containers using docker-compose
# - Provide the instances you want to launch as arguments -- each must
#   correspond to an .env file in "/env_files". Will prompt for a single
#   instance if not provided

cd "$(dirname "$0")"

# Put this in new variable so we can preserve it between instances
ENV_TAG=$TAG

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

echo -e "Launching Conforma image: $TAG"

for instance in "${ARGS[@]}"; do
    source default.env
    TAG=${ENV_TAG:-$TAG}
    export ENV_FILE=env_files/$instance.env
    if ! [[ -f $ENV_FILE ]]; then
        echo "Can't find $ENV_FILE... skipping $instance"
        break
    fi
    source $ENV_FILE

    # Get $TAG from either (in priority order):
    # - .env file
    # - Current envinronment vars
    # - default.env
    if [ -z "$TAG" ]; then
        echo -e "The \$TAG environment variable has not been set.\nPlease enter the build tag now (or leave blank to skip instance $instance):"
        read tag
        if [ -z "$tag" ]; then
            echo "No TAG specified... skipping $instance"
            break
        fi
        TAG=$tag
    fi

    # Need to re-export these vars so they're available to the scope of the
    # docker compose command we're about to launch
    export TAG=$TAG
    echo -e " - Tag: $TAG"

    if [ -z "$BACKUPS_FOLDER" ]; then
        echo "No BACKUPS_FOLDER specified... skipping $instance"
        break
    fi
    export BACKUPS_FOLDER=$BACKUPS_FOLDER
    echo -e " - Backups folder: $BACKUPS_FOLDER"

    export SNAPSHOTS_FOLDER=$SNAPSHOTS_FOLDER
    if [ -z "$SNAPSHOTS_FOLDER" ]; then
        echo "No SNAPSHOTS_FOLDER specified... skipping $instance"
        break
    fi
    echo -e " - Snapshots folder: $SNAPSHOTS_FOLDER"

    export PORT_APP=$PORT
    if [ -z "$PORT" ]; then
        echo "No PORT specified... skipping $instance"
        break
    fi
    echo -e " - Conforma exposed on Port: $PORT_APP"

    export PORT_DASH=$((PORT_APP + 1))
    echo -e " - Dashboard exposed on Port: $PORT_DASH"

    export WEB_HOST=$WEB_HOST
    if [ -z "$WEB_HOST" ]; then
        echo "No WEB_HOST specified... skipping $instance"
        break
    fi
    echo -e " - Website host: $WEB_HOST"

    # If no JWT_SECRET specified, use a random one
    export JWT_SECRET=${JWT_SECRET:-$(openssl rand -hex 64)}

    NAME=conforma-$instance-on-$PORT

    # Uncomment following line to test inputs without launching Conforma:
    # echo $JWT_SECRET
    # exit 0

    # Stop current instance (if running)
    echo -e "\n(Re-)starting $NAME..."
    sudo -E docker compose --project-name $NAME down

    # Restart using new image tag
    sudo -E docker compose -f docker-compose.yml --project-name $NAME up -d

    unset TAG
    unset BACKUPS_FOLDER
    unset SNAPSHOTS_FOLDER
    unset PORT
    unset WEB_HOST
done
