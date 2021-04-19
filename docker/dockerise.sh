#!/bin/bash

# This command requires githubtoken.txt, in the repo root (it's git ingored btw). 
# githubtoken.txt should contain github token: https://github.com/settings/tokens -> generate new token -> [x] read:packages

docker build \
   --progress plain \
   -t testbuild \
   --build-arg SERVER_BRANCH=309-Dockerise-local-build-of-combined-back-and-front-end \
   --build-arg WEB_APP_BRANCH=master \
   --build-arg NODE_VERSION=14 \
   --build-arg POSTGRES_VERSION=12 \
   --secret id=githubtoken,src=../githubtoken.txt \
   .

# -t testbuild -> tag for the image, would be something like 'TMF-application-manager:B-{back end tag}-F-{front end tag}'
# --build-arg SERVER_BRANCH and WEB_APP_BRANCH -> branch of front and back end to pull and build (should be able to use just the tag name), can escape # with \#
# --secret id=githubtoken,src=../githubtoken.txt -> can 'secretly' and temporarily mount file (see top comment about this particular file)
# --no-cache -> can be used to re-build (if for example branch content you are building has changed)
# --progress plain -> show full progress