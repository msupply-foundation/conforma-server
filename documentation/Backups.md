# Backups

Conforma server has built-in simple backup functionality -- it will save an (optionally) AES-encrypted [snapshot](Snapshots.md) .zip file to a backups folder, which can be synced to a cloud service, such as [Dropbox](https://www.dropbox.com).

Internally (within the Docker container), backups are always saved to the root `/backups` folder. However, using docker-compose configuration, this folder can be mapped to any folder on the host system, which can be synced to a cloud storage service.

## Configuration

### Environment variables

The location of the backups folder (on the host system) and the encryption password must be provided as environment variables when launching the server, as per the [Demo Server guide](Demo-Server-Guide.md#launching-instances-with-docker-compose):

```bash
export BACKUPS_FOLDER='~/Dropbox/Conforma_backups' # For example
export BACKUPS_PASSWORD='<super-secret-encryption-key>' # Store this safely elsewhere
```

If `BACKUPS_FOLDER` is not provided, it will default to a folder called "backups" in the Docker volumes default location: ` /var/lib/docker/volumes/ `.

If `BACKUPS_PASSWORD` it not provided, backup .zip files will be unencrypted.

### Preferences

The `preferences.json` file (saved with each snapshot) contains three (optional) prefs that affect backup behaviour:

```
{
  "server": {
    ...,
    "backupFilePrefix": "conforma_backup",
    "backupSchedule": [1],
    "maxBackupDurationDays: 10
  },
  ...
}
```
- `backupFilePrefix` -- backup files will be created with the filename: `<backupFilePrefix>_<timestamp>.zip`. E.g. `conforma_backup_2022-10-29_01-00-00.zip`. The default (if not provided) is `conforma_backup`
- `backupSchedule` -- specifies the backup schedule in [node-schedule](https://www.npmjs.com/package/node-schedule) format. By default (and as shown here), this will be at 1 A.M daily.
- `maxBackupDurationDays` -- specifies how long to keep backup files for. When a backup runs, any backups older than this are deleted. (Default: 10)

## Backing up with Dropbox

The backup folder can be synced to any cloud storage service, but here are instructions for setting up Dropbox on our Linux servers:

### Installation

*Instructions adapted from https://www.dropbox.com/install-linux*

- Download:  
  `cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -`
- Launch the Dropbox daemon:  
  `~/.dropbox-dist/dropboxd`

When running Dropbox on your server for the first time, you’ll be asked to copy and paste a link in a working browser to create a new account or add your server to an existing account. Once you do, your Dropbox folder will be created in your home directory.

### Controlling Dropbox via command line

A [python script is available](https://www.dropbox.com/download?dl=packages/dropbox.py) which allows interaction with the Dropbox daemon via the command line.

Save this file somewhere handy on the server (e.g. in the Home folder), then alias it in your Bash path:

- Open the bash config file for editing:
  `nano ~/.bashrc`
- Append the script alias:
  `# Control Dropbox using python script`
  `alias dropbox='python3 ~/dropbox.py'  # dropbox.py in home folder`
- Save and close the file
- Activate aliases:
  `source ~/.bashrc`

After this, you should be able to run commands with the alias `dropbox`. E.g.

```bash
dropbox  # List available commands

dropbox status  # Show status of daemon

dropbox start  # Start dropbox

dropbox stop # Stop dropbox

# etc.

```

If you're syncing with an existing Dropbox account, it is recommended that you exclude folders other than the Conforma backups folder to avoid taking up unnecessary space on the host system. Use the command `dropbox help exclude` for further instructions on this.


### Unlinking Dropbox account

There's no simple way to just unlink the current Dropbox account and link a different one -- you basically have to uninstall the Dropbox daemon and re-install it:

```bash
dropbox stop
dropbox status  # Should report "not running"
rm -rf ~/.dropbox-dist
rm -rf /var/lib/dropbox
rm -rf ~/.dropbox*
```

Then repeat the [installation](#installation) procedure above.