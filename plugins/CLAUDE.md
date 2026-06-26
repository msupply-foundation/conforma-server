# plugins/ — action plugins

Each `action_*/` folder is a **standalone npm package** implementing one action that the trigger/action runtime can invoke. They are the main extensibility mechanism for "things that happen automatically" (send notification, change status/stage, generate document, grant/revoke permissions, modify records, …). The runtime that calls them is in [`src/components/actions/`](../src/components/actions/CLAUDE.md). (Repo overview: [../CLAUDE.md](../CLAUDE.md). Reference: [../documentation/Action-plugin-specification.md](../documentation/Action-plugin-specification.md), [../documentation/List-of-Action-plugins.md](../documentation/List-of-Action-plugins.md).)

There are ~24 plugins here (e.g. `action_send_notification`, `action_change_status`, `action_increment_stage`, `action_grant_permissions`, `action_generate_document`). `action_console_log` is the simplest read-along example; `types.ts` defines the shared contract.

## Anatomy of a plugin

```
action_<name>/
  plugin.json        Metadata loaded at startup (code, name, params, outputs)
  package.json       Standalone package + build script
  src/
    index.ts         Exports `action` (the entry function)
    <implementation>.ts
    databaseMethods.ts   (optional) DB helpers for this plugin
  build/             Compiled JS (+ its own node_modules) — what runs in production
```

**`plugin.json`** declares `code` (unique id used in templates/DB), `name`, `description`, `required_parameters`, `optional_parameters`, and `output_properties`.

**The function contract** (`plugins/types.ts`):

```ts
const action: ActionPluginType = async ({
  parameters,        // evaluated params (from the template's parameter_queries)
  applicationData,   // user/org/responses/review/env for this run
  outputCumulative,  // merged output of prior sequential actions
  DBConnect,         // database connection
}) => {
  try {
    // …do the work…
    return { status: ActionQueueStatus.Success, error_log: '', output: { /* … */ } }
  } catch (err) {
    return { status: ActionQueueStatus.Fail, error_log: errorMessage(err) }
  }
}
export { action }
```

`output` is merged into `outputCumulative` for the next sequential action.

## Add a new plugin

1. Create `plugins/action_<name>/` with `package.json`, `plugin.json`, and `src/index.ts`.
2. Implement the `ActionPluginType` function and `export { action }` from `index.ts`.
3. Build: `yarn build_plugins` (from repo root) — or the plugin's own `build` script.
4. Restart the server. On startup, `registerPlugins.ts` syncs the filesystem with the `action_plugin` DB table (adds new plugins, updates changed metadata, **removes** plugins whose folder is gone), and `loadActions` imports each `action` into the global `actionLibrary`.
5. Wire it into a template's `template_action` (via the Template Builder / Actions tab in the web-app) so a trigger will invoke it.

## Gotchas

- **They're separate packages.** `yarn build_plugins` compiles each one with its own dependencies into `build/`. In **dev** the server loads the plugins' `.ts` directly; in **production** it loads the compiled `build/plugins/<name>/`. `yarn build` (root) builds plugins as part of the full build.
- **No hot reload** — restart the server to pick up new/changed plugin code (and to re-run registration).
- The DB row stores the **path** to the plugin's entry; renaming/moving a folder without rebuilding + restarting breaks loading.
- Keep `plugin.json` parameter declarations in sync with what the function actually reads — the Template Builder UI uses them.
- **Not every `action_*` folder is a normal plugin**: `action_alias` is a placeholder whose `src/index.ts` exports no `action` — aliasing is resolved in the runtime ([helpers.ts](../src/components/actions/helpers.ts)), not by a plugin function.
