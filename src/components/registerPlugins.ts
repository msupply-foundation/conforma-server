// Runs at server start. It checks the (Action) plugins folder
// and the Database action table and loads any new plugins into the database
// It should also give a warning about any plugins in the database that are
// no longer available in the system and removes them from the Database.
// Should also compare and update name, description, etc.
// The unique identifier for a plugin is its "code".

import * as fs from 'fs'
import path from 'path'
import getAppRootDir from './getAppRoot'
import * as config from '../config.json'
import PostgresDB from './postgresConnect'

const pluginFolder = path.join(getAppRootDir(), config.pluginsFolder)

export default async function registerPlugins() {
  // Load plugin info from files
  console.log('Scanning plugins folder...')
  const plugins = fs
    .readdirSync(pluginFolder)
    .filter((item) => fs.statSync(path.join(pluginFolder, item)).isDirectory())
    .map((item) => {
      return { path: path.join(item, 'src') }
    })
    .filter((item) => fs.existsSync(path.join(pluginFolder, item.path, 'plugin.json')))
    .map((item) => {
      const pluginObject = {
        ...item,
        ...JSON.parse(fs.readFileSync(path.join(pluginFolder, item.path, 'plugin.json'), 'utf8')),
      }
      pluginObject.path = path.join(pluginObject.path, pluginObject.file)
      return pluginObject
    })

  // Load plugin info from Database
  const dbPlugins = await PostgresDB.getActions()
  // Check if any in DB now missing from files -- alert if so.
  const pluginCodes = plugins.map((item) => item.code)
  const missingPlugins = dbPlugins.filter((item) => !pluginCodes.includes(item.code))
  for (let index = 0; index < missingPlugins.length; index++) {
    const missingPlugin = missingPlugins[index]
    console.warn('ALERT: Plug-in file missing:', missingPlugin.name)
    try {
      await PostgresDB.deleteFromPlugins([missingPlugin.code])
      console.log('Plugin de-registered:', missingPlugin.name)
    } catch (err) {
      console.error("Couldn't remove plug-in:", missingPlugin.name)
      console.error(err)
    }
  }

  // Compare each plugin against Database record
  const dbPluginCodes = dbPlugins.map((item) => item.code)
  const unregisteredPlugins = plugins.filter((plugin) => !dbPluginCodes.includes(plugin.code))

  // Register new plugins
  for (let index = 0; index < unregisteredPlugins.length; index++) {
    const plugin = unregisteredPlugins[index]
    try {
      await PostgresDB.addPlugin(plugin)
      console.log('Plugin registered:', plugin.name)
    } catch (err) {
      console.error('There was a problem registering', plugin.name)
      console.error(err)
    }
  }

  // Update plugin DB details if changed
  for (let index = 0; index < plugins.length; index++) {
    const plugin = plugins[index]
    const dbPlugin = dbPlugins.find((item) => item.code === plugin.code)

    if (
      dbPlugin &&
      (plugin.name !== dbPlugin.name || plugin.description !== dbPlugin.description)
    ) {
      try {
        await PostgresDB.updatePlugin(plugin)
        console.log('Plugin updated:', plugin.name)
      } catch (err) {
        console.error('There was a problem updating', plugin.name)
        console.error(err)
      }
    }
  }
}
