# Action plugin specification

Please see [Triggers & Actions](./Triggers-and-Actions.md) for an explanation of how the trigger/action system works.

This document gives the specification for the **Action plugins** themselves.

## Location & Folder contents

Action plugins reside in `/src/plugins`. Each plugin is contained within its own subfolder. The name of the folder does not matter in terms of behaviour, but should be named something consistent with existing plugins.

Within a plugin's folder are the following files:

- `jest.config.js` -- Contains automated tests for the plugin that run whenever `test` is run in the project.
- `package.json` -- A standard `npm` package.json file which treats this plugin's folder as a distinct package.
- `tsconfig.json` -- Typescript configuration file. Shouldn't need to be changed.
- `/src` -- folder containing plugin source code and metadata
- `/src/plugin.json` -- contains metadata for the plugin. The system reads this file (at startup) to load all the relevant information about the plugin into the database, so make sure it is accurate and up-to-date. Further details below.
- `/src/<plugin-name>.ts` -- Typescript source code
- `/src/<plugin-name>.js` -- Javascript code compiled from Typescript. This is what is actually loaded and run in the built server app.

## Source code file

The main source code for the plugin is simply an exported function that the server app dynamically loads via `require` at run-time. Plugin code should follow this basic structure:

```
module.exports['consoleLog'] = function (parameters: any) {
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
```

In this case `consoleLog` is the name of the function called by the Action module. Relevant code sits within the `try` block. The `catch (error)` block should be left as is (unless you wish to break it down into more specific errors) -- this ensures the `action_queue` table keeps a record of the success or failure of each action.

All parameters are passed in as keys/values in the `parameters` object. The plugin specifies the names of the parameter fields it is expecting (in `plugin.json`, below), and the template associated with this Action stores [expressions/queries](./Query-Syntax.md) to generate the values. These values are evaluated when the action is triggered and stored in the action_queue. The evaluated parameters are passed to the Action when its function is called.

In the simple example above, the only parameter expected is `message`, which the function prints to the Console.

## `plugin.json` file

The `plugin.json` file contains all the plugins metadata. This includes the essential information that is loaded into the database that affects the functioning of the plugin, plus other information that may become useful in the future (i.e. not implemented yet).

Example `plugin.json` (from Console Logger):

```
{
  "type": "action_plugin",
  "code": "cLog",
  "name": "Console Logger",
  "file": "consoleLog",
  "function_name": "consoleLog",
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
  - Actions are stored in an in-memory Action library that maps `code` to the function name.
  - Templates store the actions associated with them by referencing this `code`
- `name` -- the name displayed in the UI (e.g. Template Builder)
- `description` -- short explanation of the plugin's functionality. Also displayed in the UI.
- `file` -- the name of the source code file. Don't include the file extension, as the dynamic import will read from either the `.js` or `.ts` file depending on context (development vs. build).
- `function_name` -- the name of the function exported in the source code file. If this name is changed in that file, it _must_ be updated here, or else the app won't find the function.
- `required_parameters` -- an array of strings that define the names of the fields that must be supplied to the plugin at runtime. Templates store the values (or dynamic expressions) that map to these field names.

## How plugins are loaded.

## Development and build process

## List of Action plugins created to-date:

- Console Log
