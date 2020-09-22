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

In this case `consoleLog` is the name of the function called by the Action module. Relevant code sits within the `try` block. The `catch (error)` block should be left as is -- this ensures the `action_queue` table keeps a record of the success or failure of each action.

All parameters are passed in in the `parameters` object. The plugin specifies the names of the parameter fields it is expecting, and the template associated with this Action stores [expressions/queries](./Query-Syntax.md) to generate the values. These values are evaluated when the action is triggered and stored in the action_queue. The evaluated parameters are passed to the Action when its function is called.

In the simple example above, the only parameter expected is `message`, which the function prints to the Console.

## plugin.json file

## Development and build process
