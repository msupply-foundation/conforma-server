// Runs at server start. It checks the (Action) plugins folder
// and the Database action table and loads any new plugins into the database
// It should also give a warning about any plugins in the database that are
// no longer available in the system and removes them from the Database.
// Should also compare and update name, description, etc.
// The unique identifier for a plugin is its "code".

import * as fs from "fs";
import path from "path";
import { DatabaseResult } from "./triggersAndActions";
import getAppRootDir from "./getAppRoot";

const pluginFolder = path.join(getAppRootDir(), "plugins"); //Change this to config file

export default async function registerPlugins(client: { [key: string]: Function }) {
  // Load plugin info from files
  console.log("Scanning plugins folder...");
  const plugins = fs
    .readdirSync(pluginFolder)
    .filter((item) => fs.statSync(path.join(pluginFolder, item)).isDirectory())
    .map((item) => {
      return { path: path.join(item, "src") };
    })
    .filter((item) => fs.existsSync(path.join(pluginFolder, item.path, "plugin.json")))
    .map((item) => {
      const pluginObject = {
        ...item,
        ...JSON.parse(fs.readFileSync(path.join(pluginFolder, item.path, "plugin.json"), "utf8")),
      };
      pluginObject.path = path.join(pluginObject.path, pluginObject.file);
      return pluginObject;
    });

  // Load plugin info from Database
  const res: DatabaseResult = await client.query("SELECT * FROM action_plugin");
  const dbPlugins = res.rows;
  // Check if any in DB now missing from files -- alert if so.
  const pluginCodes = plugins.map((item) => item.code);
  const missingPlugins = dbPlugins.filter((item) => !pluginCodes.includes(item.code));
  for (let index = 0; index < missingPlugins.length; index++) {
    const missingPlugin = missingPlugins[index];
    console.warn("ALERT: Plug-in file missing:", missingPlugin.name);
    try {
      await client.query("DELETE FROM action_plugin WHERE code = $1", [missingPlugin.code]);
      console.log("Plugin de-registered:", missingPlugin.name);
    } catch (err) {
      console.error("Couldn't remove plug-in:", missingPlugin.name);
      console.error(err);
    }
  }

  // Compare each plugin against Database record
  const dbPluginCodes = dbPlugins.map((item) => item.code);
  const unregisteredPlugins = plugins.filter((plugin) => !dbPluginCodes.includes(plugin.code));
  const dbQuery =
    "INSERT INTO action_plugin (code, name, description, path, function_name, required_parameters) VALUES ($1, $2, $3, $4, $5, $6);";

  // Register new plugins
  for (let index = 0; index < unregisteredPlugins.length; index++) {
    const plugin = unregisteredPlugins[index];
    try {
      await client.query(dbQuery, [
        plugin.code,
        plugin.name,
        plugin.description,
        plugin.path,
        plugin.function_name,
        plugin.required_parameters,
      ]);
      console.log("Plugin registered:", plugin.name);
    } catch (err) {
      console.error("There was a problem registering", plugin.name);
      console.error(err);
    }
  }

  // Update plugin DB details if changed
  for (let index = 0; index < plugins.length; index++) {
    const plugin = plugins[index];
    const dbPlugin = dbPlugins.find((item) => item.code === plugin.code);

    if (dbPlugin && (plugin.name !== dbPlugin.name || plugin.description !== dbPlugin.description)) {
      try {
        await client.query(
          "UPDATE action_plugin SET name = $1, description = $2, path = $3, function_name = $4, required_parameters = $5 WHERE code = $6",
          [plugin.name, plugin.description, plugin.path, plugin.function_name, plugin.required_parameters, plugin.code]
        );
        console.log("Plugin updated:", plugin.name);
      } catch (err) {
        console.error("There was a problem updating", plugin.name);
        console.error(err);
      }
    }
  }
}
