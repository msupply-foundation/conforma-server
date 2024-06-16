## Performance Tweaks Guid

During the latest round of performance improvements we had to do quite a lot of performance related test, which were best done on the actual demo server.
In that time I accumulated quite a few CLI commands that can be helpful in the future.

## Getting inside the docker container

After ssh to the demo server.

```bash
docker container ls
```

This would list container and ids and the port mappings, you can find which port is mapped to which demo instance, check out NGINX config

```bash
cat /etc/nginx/sites-enabled/default
```

Now you can enter container via

```bash
docker exec -ti {container id} /bin/bash
```

## Going to postgres

From within docker container

```bash
su postgres
psql
\c tmf_app_manager
```

use `exit` command (twice) to go back to the root user

## Restarting postgrahile without permissions

From within docker container

```bash
lsof -i tcp:5000
kill -9 {process id}
```

Then run postgraphile start as per: entry.sh, but remove -r graphile_user

https://github.com/msupply-foundation/conforma-server/blob/56dd0aaa1adda07f8b55099bd29fd4295def63fb/docker/entry.sh#L25-L31

## Quick way to check parts of your code

I've been updating rowLevelPolicyHelper.ts, and wanted to see how these new policies work on demo server

After updating the file locally, and doing `yarn build`

Copy newly built files from local computer

```bash
scp -i {key} {repo_root}/conforma-server/build/src/components/permissions/rowLevelPolicyHelpers.js ubuntu@d{demo server}:/home/ubuntu
```

Then from demo server

```bash
docker cp rowLevelPolicyHelpers.js {container id}:/usr/src/conforma-server/build/src/components/permissions/
```

After that have to restart the server

From docker container

```bash
lsof -i tcp:8080
kill -9 {process id}
```

Then run server start, as per: entry.sh

https://github.com/msupply-foundation/conforma-server/blob/56dd0aaa1adda07f8b55099bd29fd4295def63fb/docker/entry.sh#L39

## Benching - PG Bench

From docker container, as root user

```bash
apt-get update
apt-get install pgbench
```

Then go to postgres user and create bench file (can also copy with scp command, but it must be readable by postgres user)

```bash
su postgres
cd ~/
nano bench.sql
```

Paste you command, i.e.

```SQL
BEGIN;
set local jwt.check to '0,9,87,91,94,95,96,98,99,100,105,106,107,108,109,111,112,114,116,122,123,124,125,126,128,129,130,131,132,133,136,138,139,140,141,142,143,145,146,147,148,149,150,151,152,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194';

select * from application where template_id = any
(string_to_array(COALESCE(current_setting('jwt.check', true), '0'), ',')::integer[])
COMMIT;
```

Then `ctrl + x, y`

```bash
pgbench -f bench.sql --log --transactions=30 tmf_app_manager
```

## Benching via graphql

In the browser inspector you can find the query and the variables under network -> payload (for the query you want to bench).

You can copy value of the query and variables, and paste it into the graphiql of the server. And after that you can edit authorisation header and see network tab while running individual queries

## Seeing how policies are generated

From the docker postgres you can get all policies via 

```
select json_agg(rules) from permission_policy;
```

Scroll down a little bit, copy the json, paste into your favorite formatter.

Then you can test their output using `rowLevelPolicyGeneration.test.ts`, (add print console commands where needed)






