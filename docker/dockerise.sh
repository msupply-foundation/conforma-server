#!/bin/bash

# tag (-t) of docker build should be combination of server tag and web app tag

docker build -t testbuild \
   --build-arg SERVER_BRANCH=\#306-prepare-back-end-build \
   --build-arg WEB_APP_BRANCH=master \
   --build-arg NODE_VERSION=14 \
   --build-arg POSTGRES_VERSION=12 \
   --secret id=githubtoken,src=../githubtoken.txt \
   .