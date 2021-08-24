### SSH

<ins>connect to instance</ins>

```bash
export KEY_LOC='~/Documents/private/irimskey.pem'

ssh -i $KEY_LOC ubuntu@irims-demo.msupply.org
```

<ins>move files/folder to/from instance</ins>

```bash
export KEY_LOC='~/Documents/private/irimskey.pem'

# demo server scripts
scp -r -i $KEY_LOC ./demo_server ubuntu@irims-demo.msupply.org:/home/ubuntu/

# nginx config for demo server to local
scp -i $KEY_LOC ubuntu@irims-demo.msupply.org:/etc/nginx/sites-enabled/default ./demo_server/nginx_config

# cannot directly replace default config, need to do it as sudo, so from within docker instance
sudo mv demo_server/nginx_config/default /etc/nginx/sites-enabled/
```

### NGINX

Everything should be configured via `default` config. Cert bot was installed and should auto update certs (https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx).

After changing config as per above, run

`sudo service nginx restart`

Logs are in /var/log/nginx

### Docker Compose

Docker compose will complain if directories are not present, create them if needed (they will persist when restarting image, even if `docker compose down` was run)

```bash
mkdir app_snapshots_on_port_8000
mkdir grafana_on_port_8001

mkdir grafana_on_port_8003
mkdir grafana_on_port_8005
mkdir grafana_on_port_8007
mkdir grafana_on_port_8009
```

<ins>launching all</ins>

```bash
export TAG='front-demo-19-08-2021_back-demo-19-08-2021_pg-12_node-14'

# -d is for detached, if you want to see all output then start without -d
PORT_APP=8000 PORT_DASH=8001 sudo docker compose --project-name 'mflow-on-8000' up -d

PORT_APP=8002 PORT_DASH=8003 sudo docker compose --project-name 'mflow-on-8002' up -d
PORT_APP=8004 PORT_DASH=8005 sudo docker compose --project-name 'mflow-on-8004' up -d
PORT_APP=8006 PORT_DASH=8007 sudo docker compose --project-name 'mflow-on-8006' up -d
PORT_APP=8008 PORT_DASH=8009 sudo docker compose --project-name 'mflow-on-8008' up -d
```

<ins>list container</ins>

`sudo docker container ls`

<ins>bin bash inside container</ins>

`sudo docker exec -ti mflow-on-8000_app_1 /bin/bash`

<ins>view logs</ins>

```bash
# don't need bash inside contiainer for this
sudo docker exec -ti mflow-on-8000_app_1 cat /var/log/application_manager/server.log
sudo docker exec -ti mflow-on-8000_app_1 cat /var/log/application_manager/graphile.log
```

<ins>stop or remove</ins>

```bash
# to stop
sudo docker compose --project-name 'mflow-on-8000' stop
# to remove (when new version is out)
sudo docker compose --project-name 'mflow-on-8000' rm
```

Have t

### Prior To Docker Compose

<ins>list local images</ins>

`sudo docker images`

<ins>remove all containers</ins>

`sudo docker rm $(sudo docker ps -a -q)`

<ins>remove all images</ins>

`sudo docker rmi -f $(sudo docker images -a -q)`

<ins>remove all images</ins>

`sudo docker volume prune`
