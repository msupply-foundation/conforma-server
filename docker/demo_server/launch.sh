#!/bin/bash

# Script to start (or restart) one or more containers using docker-compose
# - Image tag must be provided as environment variable $TAG
# - Provide the instances/ports (e.g. 8000 8002) as arguments -- each must
#   correspond to an .env file in "/env_files". If no args provided, will
#   default to 8000

if [ -z "$TAG" ]; then
    echo ">> Missing environment variable: \$TAG"
    exit 1
fi

if [ "$#" -eq 0 ]; then
    ARGS=(8000)
else
    ARGS=("$@")
fi

for PORT in "${ARGS[@]}"; do
    export PORT_APP=$PORT
    export PORT_DASH=$((PORT_APP + 1))
    export JWT_SECRET=$(openssl rand -hex 10)

    NAME=conforma-on-$PORT_APP

    # Stop current instance (if running)
    echo -e "\n(Re-)starting $NAME..."
    sudo -E docker-compose --project-name $NAME down

    # Restart using new image tag
    sudo -E docker-compose --project-name $NAME up -d
done
