# syntax = docker/dockerfile:experimental
#DOCKER_BUILDKIT=1 docker build --progress=plain -t allbuild --secret id=githubtoken,src=../../../githubtoken.txt .

FROM ubuntu:18.04

ARG SERVER_BRANCH=master
ARG WEB_APP_BRANCH=master

ARG NODE_VERSION=14
ARG POSTGRES_VERSION=12

RUN apt update
RUN apt-get update
RUN apt upgrade -y
RUN apt-get upgrade -y

# --- CURL
RUN apt-get install curl -y

# --- NANO
RUN apt-get install nano -y

# --- GIT
RUN apt-get install git -y

# --- GOSU
RUN apt-get install gosu -y

# --- NGINX
RUN apt-get install nginx -y

# --- NODE
# https://github.com/nodesource/distributions/blob/master/README.md -> Node.js LTS (v14.x): -> # Using Debian, as root
RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash 
RUN apt-get install -y nodejs
RUN node -v

# --- POSTGRES 
# https://www.postgresql.org/download/linux/ubuntu/
RUN echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" >> /etc/apt/sources.list.d/pgdg.list
RUN curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add
RUN apt-get update
# make sure postgresql install is propmpt free
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y postgresql-${POSTGRES_VERSION}

# --- YARN
RUN curl -fsSL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add 
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get install yarn -y

# --- ADD REPOS
WORKDIR /usr/src/
RUN git clone -b ${SERVER_BRANCH} https://github.com/openmsupply/application-manager-server.git
RUN git clone -b ${WEB_APP_BRANCH} https://github.com/openmsupply/application-manager-web-app.git

# --- BUILD SERVER
WORKDIR /usr/src/application-manager-server
RUN cp .npmrc .npmrc_backup
RUN --mount=type=secret,id=githubtoken,dst=/githubtoken echo "//npm.pkg.github.com/:_authToken=$(cat /githubtoken)" >> .npmrc
RUN yarn install
RUN yarn build
RUN rm .npmrc && mv .npmrc_backup .npmrc

# --- BUILD WEB APP
WORKDIR /usr/src/application-manager-web-app
RUN cp .npmrc .npmrc_backup
RUN --mount=type=secret,id=githubtoken,dst=/githubtoken echo "//npm.pkg.github.com/:_authToken=$(cat /githubtoken)" >> .npmrc
COPY web_app_config/config.json src/
RUN yarn install
RUN yarn build
RUN rm .npmrc && mv .npmrc_backup .npmrc

# --- ADD NGINX CONFIG
COPY nginx_config/application_manager.conf /etc/nginx/conf.d/

# --- ADD POSTGRES CONFIG
WORKDIR /etc/postgresql/${POSTGRES_VERSION}/main
COPY postgres_config/pg_hba.conf .

# --- INITIALISE DATABASE
WORKDIR /usr/src/initialise_database
COPY database.sh .
RUN ./database.sh

# --- CREATE LOG DIR
WORKDIR /var/log/application_manager

# --- PREPARING ENTRY
WORKDIR /usr/src/entry
COPY entry.sh .
WORKDIR /usr/src/application-manager-server
ENTRYPOINT /./usr/src/entry/entry.sh

EXPOSE 3000