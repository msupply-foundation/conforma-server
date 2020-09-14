# application-manager-server

Install dependencies:  
`yarn install`

Initialise database:  
`yarn database_init`  
(Needs `psql` command-line tool to be installed, and a super-user named `postgres` -- [here](https://gist.github.com/ibraheem4/ce5ccd3e4d7a65589ce84f2a3b7c23a3) for instructions.  
Creates a database named `tmf_app_manager` and populates it with minimal data.)

To run in dev mode:  
`yarn dev`

To launch Postgraphile server (in a new Terminal process):  
`yarn pg`

To launch in dev mode _with_ Postgraphile server:  
`yarn dev_pg`

To build (compiles all .ts files to .js in `build` folder):  
`yarn build`

To build and run compiled files:  
`yarn start`

In dev mode, uses `nodemon` to monitor changes, and `ts-node` to compile typescript files on the fly.

Note: Plugins (in `src/plugins`) are **standalone packages** and must be compiled individually. However, they should come pre-compiled and are copied to the `build` folder when building the server app. To automatically re-compile all plugins, run `yarn build_plugins`.

This repo has the following functionality implemented in basic form:

- Fastify server with endpoints for:
  - File upload (and register in database)
  - File download (by database ID)
- Triggers and Actions, including:
  - Register plugins on startup
  - Run actions in response to Database triggers
  - Create scheduled actions (using `node-schedule` which I'm not sure is the best way to go)
- `evaluateExpression` module

## Triggers and Actions

In order to see Triggers and Actions working, you'll need to run the `createSchema.sql` then `insertData.sql` scripts in the database folder.

The application with ID = 3 (Company registration: Company C) has one Action associated with it, the Console logger. All it does is write a message to the console, and you can see the details on the `template_action` table.

To cause a Trigger to initiate the Action, change the `trigger` field on the application:  
`UPDATE application SET trigger = 'onApplicationSubmit' WHERE id = 3`

You should see the message printed to the console.

Also, check the `action_plugin` table to see a couple of extra dummy plugins that automatically get registered on startup.

## evaluateExpression

Documented in the `Query-Syntax.md` in the documentation folder.

Code is in the `modules` folder.

To test, run: `yarn test` (uses installed Jest)

## Documentation

Developer documentation available in documentation folder -- intended for publication to this repo's wiki. See the documentation's own README for more information
