# _Conforma_ New server setup on Ubuntu 10.04

Steps to create new server:

- Have new server running on Openstack
- Add the BW entry "Angola Conforma Server"
- After provided with public key, access via terminal using ssh
- Installed Docker engine as instructed here: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04
- Logged in to docker hub (terminal `docker login`) as msupplyfoundation user
- Pulled last image from docker-hub:
  sudo docker pull msupplyfoundation/conforma-demo:build-v0.2.0-1_2022-02-23_pg-12_node-14"
- Set all required ENV VARIABLES
- Installed Docker compose:
  `sudo apt install docker-compose`
- Upgraded Docker compose to v2 as instructed here: https://docs.docker.com/compose/cli-command/#install-on-linux
- Copied demo-server folder to new server with `scp`
- Configured the domain: for https://angola.conforma.nz/ on cpanel with BW "conforma.nz cpanel"
- Install SSL Certificate with certbot (Let's encrypt)
- Install nginx and copy config from demo-server/
- Make sure nginx is running with:
  `systemctl status nginx`
- Manually changed nginx config file to forward external ports to internal: todo - add file example to demo-server folder...
- Open ports 50000 and 50001 externally on new server
- Started App & Dashboard on local ports 8000 and 8001:
  `PORT_APP=8000 PORT_DASH=8001 sudo -E docker compose --project-name 'conforma-on-8000' up -d`
  - Note that uses `docker compose` instead of `docker-compose` to use the correct package installed on the server. Otherwise (when using docker-compose) you'll get this error:
    ![Error docker-compose](images/error-docker-compose.png)
