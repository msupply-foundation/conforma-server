#!/bin/bash

# Script to start (or restart) a container using docker-compose
# - Image tag must be passed as either first argument or env variable $TAG
# - The instance/port (e.g. 8000) is optional and can be passed as either the
#   2nd arg or env variable $PORT. Will default to 8000 if not provided.

PORT="${PORT:-8000}"

export TAG="${1:-$TAG}"
export PORT_APP="${2:-$PORT}"
export PORT_DASH=$((PORT_APP + 1))
export JWT_SECRET=$(openssl rand -hex 30)

if [ -z "$TAG" ]; then
    echo ">>Missing argument: image tag"
    echo ">>Must be provided as first argument or env variable TAG=\"<tag>\""
    exit 1
fi

echo "Tag is $TAG"
echo "Port is $PORT_APP"
exit 0

NAME=conforma-on-$PORT_APP

# Stop current instance (if running)
sudo -E docker compose --project-name $NAME down

# Restart using new image tag
sudo -E docker compose --project-name $NAME up -d
