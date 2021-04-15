# Action plugin specification

Please see [Triggers & Actions](./Triggers-and-Actions.md) for an explanation of how the trigger/action system works.

This document details the specification for the **Action plugins** themselves.

See [here](./List-of-Action-plugins.md) for a list of currently implemented Action plugins.

## Location & Folder contents

Action plugins reside in `./plugins`. Each plugin is contained within its own subfolder. The name of the folder does not matter in terms of behaviour, but should be named something consistent with existing plugins.

Within a plugin's folder are the following files:

- `package.json` -- A standard `npm` package.json file which treats this plugin's folder as a distinct package. (more details in **Development** section [below](#development))
- `/src` -- folder containing plugin source code and metadata
- `plugin.json` -- contains metadata for the plugin. The system reads this file (at startup) to load all the relevant information about the plugin into the database, so make sure it is accurate and up-to-date. Further details [below](#plugin).
- `/src/index.ts` -- A file that export the plugin entrypoint method as `action`
- `/src/*.ts` -- All other plugin files

## Source code file

Plugin can have any number of source files located in the source folder, but there must be an exported entrypoint method in `index.ts`. This method will be dynamically loaded via `require` at run-time.
Calling the function exported by each action plugin, sequentially, is the job of the **Action module**.

Plugin entrypoint method should follow this basic structure:

TO_DO describe `parameters`

```
// src/consolLog.ts
const consoleLog = (parameters: any) => {
  try {
    console.log('\nThe Console Log action is running...')
    console.log(parameters.message)
    return {
      status: 'Success',
      error_log: '',
    }
  } catch (error) {
    return {
      status: 'Fail',
      error_log: 'There was a problem',
    }
  }
}
// src/index.ts
export {default as action} from './consoleLog'
```

In this case `consoleLog` is the name of the function called by the Action module. Relevant code sits within the `try` block. The `catch (error)` block should be left as is (unless you wish to break it down into more specific errors) -- this ensures the `action_queue` table keeps a record of the success or failure of each action.

All parameters are passed in as keys/values in the `parameters` object. The plugin specifies the names of the parameter fields it is expecting (in `plugin.json`, below). The application template that is associated with the Action plugin should store [expressions/queries](./Query-Syntax.md) to generate the values for the parameter fields. These values are evaluated when the action is triggered and stored in the action_queue. The evaluated parameters are passed to the Action when its function is called.

In the simple example above, the only parameter expected is `message`, which the function prints to the Console.

<a name="plugin"></a>

## `plugin.json` file

The `plugin.json` file contains all the plugins metadata. This includes the essential information that is loaded into the database that determines the functioning of the plugin, plus other information that may become useful in the future (i.e. not implemented yet).

Example `plugin.json` (from Console Logger):

```
{
  "type": "action_plugin",
  "code": "cLog",
  "name": "Console Logger",
  "description": "All it does is print a message to the console. That's it.",
  "required_parameters": ["message"],
  "info": {
    "author": {
      "name": "The mSupply Foundation",
      "url": "http://msupply.foundation"
    },
    "keywords": ["action", "logger"],
    "logos": {
      "small": "",
      "large": ""
    },
    "links": [],
    "screenshots": [],
    "version": "1.0.0",
    "updated": "2020-08-27"
  }
}
```

Compulsory fields are:

- `code` -- this must be a unique string that identifies the plugin. It shouldn't be changed after release. This is used as an id by:
  - The database's register of installed plugins (`action_plugin` table)
  - Actions are stored in an in-memory Action library that maps `code` to the `function name`.
  - Templates store the actions associated with them by referencing this `code`
- `name` -- the name displayed in the UI (mainly Template Builder)
- `description` -- short explanation of the plugin's functionality. Also displayed in the UI.
- `required_parameters` -- an array of strings that define the names of the fields that must be supplied to the plugin at runtime. Templates store the values (or dynamic expressions) that map to these field names.

## How plugins are loaded.

At startup, the server app scans the `plugins` folder. In each plugin's subfolder, it looks for a `plugin.json` file, from which it reads the metadata. It compares this information with the list of plugins registered in `action_plugin` and updates the database accordingly:

- Adds a new record for newly-found plugins
- Updates plugin details that have changed
- Removes records for missing plugins

The `action_plugin` table is the primary record of what actions are available to the system, with the following fields stored:

- `code`
- `name`
- `description`
- `path` (determined by the folder the plugin was found in)
- `required_parameters`

<a name="development"></a>

## Development and build process

Plugins are intended to be stand-alone units, in that a user should be able to simply `yarn build` and copy content inside `build` folder to another system and have it work straight away. (Eventually, we envisage that plugins could be imported directly via the front-end UI.) To that end, each plugin is developed as its own package, with its own `package.json` and `node_modules` folder. Root typescript and testing configurations are used by default but can be overwritten

While developing a plugin, you can run the main app with:  
`yarn dev`

Any changes you make to the plugin `.ts` file will be reflected immediately in the dev environment.

After development work is complete, the plugin should be built independently by running `yarn build` **in the plugin's root folder**, which will compile plugin into .js files, and output the content in `build/{pluginName}` folder, this folder can then be copied to `projectRoot/build/plugins/` -> which happens automatically when `yarn build` is executed at the root level.

Alternatively, to build _all_ plugins from the project root folder:  
`yarn build_plugins`

## Adding packages

Simply `yarn add` from within plugin folder would add the dependency. Global (root) `yarn install` would re-install all of the dependencies via `utils/pluginScripts/yarnInstallPlugins.js`

## How are plugins built ?

When building an individual plugin from within plugin folder, `utils/pluginScripts/buildPluginFromPluginFolder.js`, which in turn uses `utils/pluginScripts/buildPlugin.js` (passing through plugin that is requesting the build)

`buildPlugin.js` executes a number of operations, with the end goal of building individual plugin (with minimal bundle size), and it's own `node_module` which will include **only** the dependencies defined in the `package.json`, even if core dependencies and functions are used (which is typically not recommended). Summary of these operations:

- create a temporary buildFolder at root level `temporaryPluginBuild`
- install plugin dependencies `yarn install` from withing the plugin folder
- create a copy of type `tsconfig.json`, aimed at only including plugin src folder (but with full project structure)
- run `tsc` and copy and copy built plugin js filed and node_modules
- clean up

One thing to note, it's very likely that jest test files will import database wrapper from core, which causes corresponding core component to be built. These are not included in the built bundle, but the built bunlde will have correct relative path to require those components

## Needs consideration

- Should the `required_parameters` specify an expected type so that the Template Builder UI knows what kind of options to present?

- Should there be (optional) **default values** for the `required_parameters`? I'm thinking, for things like "Send notification", the user's email address will be required, but it's always going to be the same query (`{operator: "objectProperties", children: [{value: {object: "user", property: "email"}}]}`) so it seems like it should there by default so the Admin doesn't have to specify an obvious value in the Template Builder.

- Currently, parameters are evaluated immeditely before the Action is saved to the `action_queue`. For immediate actions, this is fine, but for Scheduled Actions, can we imagine a use case where it would be better for them to be evaluated at the time they run (which could be much later, even years)?
