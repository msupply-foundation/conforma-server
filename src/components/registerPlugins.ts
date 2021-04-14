// Runs at server start. It checks the (Action) plugins folder
// and the Database action table and loads any new plugins into the database
// It should also give a warning about any plugins in the database that are
// no longer available in the system and removes them from the Database.
// Should also compare and update name, description, etc.
// The unique identifier for a plugin is its "code".

import * as fs from 'fs'
import path from 'path'
import { getAppRootDir } from './utilityFunctions'
import * as config from '../config.json'
import DBConnect from './databaseConnect'
import { deepEquality } from './utilityFunctions'
import { ActionPlugin } from '../types'

const pluginsFolder = path.join(getAppRootDir(), config.pluginsFolder)
const pluginJsonFilename = 'plugin.json'
const getPluginIndexPath = (pluginFolderPath: string) =>
  fs.existsSync(path.join(pluginFolderPath, 'src', 'index.js'))
    ? path.join(pluginFolderPath, 'src', 'index.js') // in production use index.js
    : path.join(pluginFolderPath, 'src', 'index.ts') // otherwoise use index.ts

export default async function registerPlugins() {
  // Load plugin info from files
  console.log('Scanning plugins folder...')
  const plugins = fs
    .readdirSync(pluginsFolder)
    .map((pluginFolder) => {
      return path.join(pluginsFolder, pluginFolder)
    })
    .filter((pluginPath) => fs.statSync(pluginPath).isDirectory())
    .filter((pluginPath) => fs.existsSync(path.join(pluginPath, pluginJsonFilename)))
    .map((pluginPath) => {
      const pluginJsonContent = fs.readFileSync(path.join(pluginPath, pluginJsonFilename), 'utf8')
      let pluginJson
      try {
        pluginJson = JSON.parse(pluginJsonContent)
      } catch (e) {
        console.log('Failed to prase plugin.json in: ' + pluginPath)
        throw e
      }
      const pluginObject = {
        ...pluginJson,
        path: getPluginIndexPath(pluginPath),
      }
      return pluginObject
    })

  // Load plugin info from Database
  const dbPlugins = await DBConnect.getActionPlugins()

  // Check if any in DB now missing from files -- alert if so.
  const pluginCodes = plugins.map((item) => item.code)
  const missingPlugins = dbPlugins.filter((item) => !pluginCodes.includes(item.code))
  for (let index = 0; index < missingPlugins.length; index++) {
    const missingPlugin = missingPlugins[index]
    console.warn('ALERT: Plug-in file missing:', missingPlugin.name)
    try {
      await DBConnect.deleteActionPlugin(missingPlugin)
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
      // TODO: Replace this with some other way to use only keys from ActionPlugin!s
      await DBConnect.addActionPlugin({
        code: plugin.code,
        name: plugin.name,
        description: plugin.description,
        path: plugin.path,
        required_parameters: plugin.required_parameters,
        output_properties: plugin.output_properties,
      })
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

    if (dbPlugin && isPluginUpdated(dbPlugin, plugin)) {
      try {
        // TODO: Replace this with some other way to use only keys from ActionPlugin!
        await DBConnect.updateActionPlugin({
          code: plugin.code,
          name: plugin.name,
          description: plugin.description,
          path: plugin.path,
          required_parameters: plugin.required_parameters,
          output_properties: plugin.output_properties,
        })
        console.log('Plugin updated:', plugin.name)
      } catch (err) {
        console.error('There was a problem updating', plugin.name)
        console.error(err)
      }
    }
  }
}

const isPluginUpdated = (dbPlugin: ActionPlugin, scannedPlugin: ActionPlugin) => {
  return (
    scannedPlugin.name !== dbPlugin.name ||
    scannedPlugin.description !== dbPlugin.description ||
    scannedPlugin.path !== dbPlugin.path ||
    !deepEquality(scannedPlugin.required_parameters, dbPlugin.required_parameters) ||
    !deepEquality(scannedPlugin.output_properties, dbPlugin.output_properties, true)
  )
}
