#!/bin/bash

# Script to start (or restart) a container using docker-compose
# - Pass the image tag as the first arg
# - Pass the instance (e.g. 8000) as the 2nd arg, which will correspond to a
#   specific `.env` file which contains environment vars

export PORT_APP="${2:-8000}"
export PORT_DASH=$((PORT_APP + 1))
export TAG=$1
export JWT_SECRET=$(openssl rand -hex 30)

NAME=conforma-on-$2

# Stop current instance (if running)
sudo -E docker compose --project-name $NAME down

# Restart using new image tag
sudo -E docker compose --project-name $NAME up -d
