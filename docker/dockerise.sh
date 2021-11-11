#!/bin/bash

# This command requires githubtoken.txt, in the repo root (it's git ingored btw).
# githubtoken.txt should contain github token: https://github.com/settings/tokens -> generate new token -> [x] read:packages

SERVER_BRANCH='B-1.0.8'
WEB_APP_BRANCH='B-1.0.8'
IMAGE_NAME='mflow-demo'
INITIAL_DATA_LOCALE=''

NODE_VERSION='14'
POSTGRES_VERSION='12'

IMAGE_TAG="front-${WEB_APP_BRANCH}_back-${SERVER_BRANCH}_pg-${POSTGRES_VERSION}_node-${NODE_VERSION}"

echo "building image: ${IMAGE_TAG}"

docker build \
   --progress plain \
   -t "${IMAGE_NAME}:${IMAGE_TAG}" \
   --build-arg SERVER_BRANCH="$SERVER_BRANCH" \
   --build-arg WEB_APP_BRANCH="$WEB_APP_BRANCH" \
   --build-arg NODE_VERSION="$NODE_VERSION" \
   --build-arg POSTGRES_VERSION="$POSTGRES_VERSION" \
   --build-arg INITIAL_DATA_LOCALE="$INITIAL_DATA_LOCALE" \
   --secret id=githubtoken,src=../githubtoken.txt \
   .

# -t testbuild -> tag for the image, would be something like 'TMF-application-manager:B-{back end tag}-F-{front end tag}'
# --build-arg SERVER_BRANCH and WEB_APP_BRANCH -> branch of front and back end to pull and build (should be able to use just the tag name), can escape # with \#
# --secret id=githubtoken,src=../githubtoken.txt -> can 'secretly' and temporarily mount file (see top comment about this particular file)
# --no-cache -> can be used to re-build (if for example branch content you are building has changed)
# --progress plain -> show full progress
