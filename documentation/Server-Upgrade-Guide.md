Quickly stop, start, and re-start Conforma instances on pre-configured servers.

For a detailed overview of the processes that these scripts automate, please see [Demo Server Guide](Demo-Server-Guide.md)

## Upgrade Conforma on a server

- Login (with SSH) to the server
- Set the tag of the latest build Docker image:  
  `export TAG='<build-tag>`
  - If `$TAG` is not specified, you will be prompted for it when launching
- Relaunch whichever instances you want to upgrade to this build:  
  `launch_conforma <instance-names, ...>`  
  e.g. `launch_conforma 50000 50004`  
  - The "instance-names" must correspond to a pre-configured `.env` file found in `~/demo_server/env_files`
  - If instances are omitted, you will be prompted for one, or you can let it use a pre-configured default
  - The launch script will automatically pull the build image from Docker hub if not already present, and stop the instance before re-launching if it's already running.
- To stop an instance (without re-starting):  
  `stop_conforma <instance-names, ...>`

Please see the script files `launch.sh` and `stop.sh` (`/docker/demo_server` in repo) to see what they're doing.

## Configure a new server

How to set up server in order for the above commands to work:

- Ensure server has the latest version of Docker installed, and nginx has been configured as per the [Demo Server Guide](Demo-Server-Guide.md)
  - [Installing Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- If it doesn't already exist, create a directory `demo_server` in the home folder:  
  `mkdir ~/demo_server`
- In the `demo_server` directory, create the following files and make sure their contents match the ones in `docker/demo_server` from this repo.
  - `docker-compose.yml`
  - `launch.sh`
  - `stop.sh`
- If you want, you can change (or remove) the `DEFAULT_INSTANCE` value in `launch.sh` and `stop.sh`
- Create directory: `~/demo_server/env_files`
- In that directory, create an .env for each instance of Conforma you want to have running on this server. The name of the file is what you will pass into the launch commands from the earlier section.  
  e.g. `50000.env`, `fiji_demo.env`, etc...
- Populate each of the `.env` files with the following (example) environment variables:  
    ```sh
    PORT=8004
    SMTP_PASSWORD='<password>'
    WEB_HOST='https://conforma-demo.msupply.org:50004'
    BACKUPS_FOLDER='~/demo_server/backups/50004'
    BACKUPS_PASSWORD='<password>'
    ```  
    Note:
    - `PORT`, `SMTP_PASSWORD` & `WEB_HOST` are *required*; the other two are optional as they have default values.
    - see the [Demo Server Guide](Demo-Server-Guide.md) for specifics of what these variables refer to.
- Lock down the permissions on all the above `.env` files -- because they contain sensitive information, we want them to be as inaccessible as possible:
    ```sh
    sudo chown root:root <file> #Make "root" the owner
    sudo chmod 700 <file> #Only owner(root) can access
    ```
- Create command aliases for the launch/stop scripts and add them to the bash configuration:
  - Edit config file: `nano ~/.bashrc`
  - Add the following lines:
  ```bash
  alias launch_conforma='sudo -E ~/demo_server/launch.sh'
  export launch_conforma
  alias stop_conforma='sudo ~/demo_server/stop.sh'
  export stop_conforma
  ```
  Note: the `sudo` is required so the scripts have access to the `.env` files (which are restricted to root), and the `-E` flag ensures the active `$TAG` environment variable is accessible