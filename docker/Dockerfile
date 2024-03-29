# syntax = docker/dockerfile:experimental
#DOCKER_BUILDKIT=1 docker build --progress=plain -t allbuild --secret id=githubtoken,src=../../../githubtoken.txt .

# This is a shortened version of the Docker build script that uses a
# previously-built image as a base for all the main Ubuntu installations. This
# is due to a problem when it uses the latest minor versions (12.18) of
# Postgres, as detailed in this issue:

# https://github.com/msupply-foundation/conforma-server/issues/1090

# Once that issue is resolved, we can remove this and continue to build with the
# newer Postgres using the full build script.

FROM msupplyfoundation/conforma:build-v0.7.9-5_2024-02-08_bb9bac

# --- DELETE INSTALLATION FROM BASE IMAGE (above)
WORKDIR /usr/src
RUN rm -rf conforma-server
RUN rm -rf conforma-web-app

# --- ADD REPOS
ARG SERVER_BRANCH=main
ARG WEB_APP_BRANCH=main
WORKDIR /usr/src/
RUN git clone -b ${SERVER_BRANCH} https://github.com/openmsupply/conforma-server.git
RUN git clone -b ${WEB_APP_BRANCH} https://github.com/openmsupply/conforma-web-app.git

# --- BUILD SERVER
WORKDIR /usr/src/conforma-server
RUN cp .npmrc .npmrc_backup
RUN echo "" >> .npmrc
RUN --mount=type=secret,id=githubtoken,dst=/githubtoken echo "//npm.pkg.github.com/:_authToken=$(cat /githubtoken)" >> .npmrc
RUN yarn install
RUN yarn build
RUN rm .npmrc && mv .npmrc_backup .npmrc

# --- BUILD WEB APP
WORKDIR /usr/src/conforma-web-app
RUN cp .npmrc .npmrc_backup
RUN echo "" >> .npmrc
RUN --mount=type=secret,id=githubtoken,dst=/githubtoken echo "//npm.pkg.github.com/:_authToken=$(cat /githubtoken)" >> .npmrc
RUN yarn install
RUN yarn build
RUN rm .npmrc && mv .npmrc_backup .npmrc

# --- ADD NGINX CONFIG
COPY nginx_config/conforma.conf /etc/nginx/conf.d/

# --- ADD POSTGRES CONFIG
WORKDIR /etc/postgresql/${POSTGRES_VERSION}/main
COPY postgres_config/postgresql.conf .
# RUN echo "listen_addresses = '*'" >> postgresql.conf
COPY postgres_config/pg_hba.conf .

# --- INITIALISE DATABASE (default: core templates)
ARG INITIAL_SNAPSHOT=""
WORKDIR /usr/src/conforma-server/database/_snapshots
COPY snapshots/${INITIAL_SNAPSHOT}/ ./${INITIAL_SNAPSHOT}

WORKDIR /usr/src/initialise_database
COPY database.sh .
RUN ./database.sh ${INITIAL_SNAPSHOT}
RUN rm -rf /usr/src/conforma-server/database/_snapshots/${INITIAL_SNAPSHOT}

# --- CREATE LOG DIR
WORKDIR /var/log/conforma

# --- PREPARING ENTRY
WORKDIR /usr/src/entry
COPY entry.sh .
WORKDIR /usr/src/conforma-server
ENTRYPOINT /./usr/src/entry/entry.sh

EXPOSE 3000