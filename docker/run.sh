#!/bin/bash

# To exit container, type 'exit'

docker run \
    -ti \
    -p 3000:3000 \
    -e 'SMTP_PASSWORD=smtp_password_goes_here' -e 'WEB_HOST=http://localhost:3000' \
    msupplyfoundation/conforma-demo:front-B-1.0.13_back-B-1.0.13_pg-12_node-14

# -ti -> interactive (connect to shell on startup)
# -p -> {localhost-port}:{container-port}, changing this would conflict with web_app_config/config.json
# testbuild -> local or remote image name

# Volumes

# Can also mount container file system (below commands can be repeated)
# -v `~/Documents/back_end_plugins:/usr/src/application_manager_server/build/plugins -> ${local-path}{container-path}

# Some common container paths

# nginx config: /etc/nginx/conf.d/
# nginx log: /var/log/nginx/
# postgresql /etc/postgresql/12/main/
# postgresql log: /var/log/postgresql/
# back end snapshots: /usr/src/application_manager_server/database/snapshots/
# back end and postgraphile log: /var/log/application_manager
