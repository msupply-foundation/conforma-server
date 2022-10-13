"use strict";
// Runs at server start. It checks the (Action) plugins folder
// and the Database action table and loads any new plugins into the database
// It should also give a warning about any plugins in the database that are
// no longer available in the system and removes them from the Database.
// Should also compare and update name, description, etc.
// The unique identifier for a plugin is its "code".
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const isEqual = require('deep-equal');
const utilityFunctions_1 = require("./utilityFunctions");
const config_1 = __importDefault(require("../config"));
const databaseConnect_1 = __importDefault(require("./databaseConnect"));
const pluginsFolderFull = path_1.default.join(utilityFunctions_1.getAppEntryPointDir(), config_1.default.pluginsFolder);
const pluginsFolder = config_1.default.pluginsFolder;
const pluginJsonFilename = 'plugin.json';
const getPluginIndexPath = (pluginFolderPath) => fs.existsSync(path_1.default.join(pluginsFolderFull, pluginFolderPath, 'src', 'index.js'))
    ? path_1.default.join(pluginsFolder, pluginFolderPath, 'src', 'index.js') // in production use index.js
    : path_1.default.join(pluginsFolder, pluginFolderPath, 'src', 'index.ts'); // otherwise use index.ts
function registerPlugins() {
    return __awaiter(this, void 0, void 0, function* () {
        // Load plugin info from files
        console.log('Scanning plugins folder...');
        const plugins = fs
            .readdirSync(pluginsFolderFull)
            .filter((pluginPath) => fs.statSync(path_1.default.join(pluginsFolderFull, pluginPath)).isDirectory())
            .filter((pluginPath) => fs.existsSync(path_1.default.join(pluginsFolderFull, pluginPath, pluginJsonFilename)))
            .map((pluginPath) => {
            const pluginJsonContent = fs.readFileSync(path_1.default.join(pluginsFolderFull, pluginPath, pluginJsonFilename), 'utf8');
            let pluginJson;
            try {
                pluginJson = JSON.parse(pluginJsonContent);
            }
            catch (e) {
                console.log('Failed to parse plugin.json in: ' + pluginPath);
                throw e;
            }
            const pluginObject = Object.assign(Object.assign({}, pluginJson), { path: getPluginIndexPath(pluginPath) });
            return pluginObject;
        });
        // Load plugin info from Database
        const dbPlugins = yield databaseConnect_1.default.getActionPlugins();
        // Check if any in DB now missing from files -- alert if so.
        const pluginCodes = plugins.map((item) => item.code);
        const missingPlugins = dbPlugins.filter((item) => !pluginCodes.includes(item.code));
        for (let index = 0; index < missingPlugins.length; index++) {
            const missingPlugin = missingPlugins[index];
            console.warn('ALERT: Plug-in file missing:', missingPlugin.name);
            try {
                yield databaseConnect_1.default.deleteActionPlugin(missingPlugin);
                console.log('Plugin de-registered:', missingPlugin.name);
            }
            catch (err) {
                console.error("Couldn't remove plug-in:", missingPlugin.name);
                console.error(err);
            }
        }
        // Compare each plugin against Database record
        const dbPluginCodes = dbPlugins.map((item) => item.code);
        const unregisteredPlugins = plugins.filter((plugin) => !dbPluginCodes.includes(plugin.code));
        // Register new plugins
        for (let index = 0; index < unregisteredPlugins.length; index++) {
            const plugin = unregisteredPlugins[index];
            try {
                // TODO: Replace this with some other way to use only keys from ActionPlugin!s
                yield databaseConnect_1.default.addActionPlugin({
                    code: plugin.code,
                    name: plugin.name,
                    description: plugin.description,
                    path: plugin.path,
                    required_parameters: plugin.required_parameters,
                    optional_parameters: plugin.optional_parameters,
                    output_properties: plugin.output_properties,
                });
                console.log('Plugin registered:', plugin.name);
            }
            catch (err) {
                console.error('There was a problem registering', plugin.name);
                console.error(err);
            }
        }
        // Update plugin DB details if changed
        for (let index = 0; index < plugins.length; index++) {
            const plugin = plugins[index];
            const dbPlugin = dbPlugins.find((item) => item.code === plugin.code);
            if (dbPlugin && isPluginUpdated(dbPlugin, plugin)) {
                try {
                    // TODO: Replace this with some other way to use only keys from ActionPlugin!
                    yield databaseConnect_1.default.updateActionPlugin({
                        code: plugin.code,
                        name: plugin.name,
                        description: plugin.description,
                        path: plugin.path,
                        required_parameters: plugin.required_parameters,
                        optional_parameters: plugin.optional_parameters,
                        output_properties: plugin.output_properties,
                    });
                    console.log('Plugin updated:', plugin.name);
                }
                catch (err) {
                    console.error('There was a problem updating', plugin.name);
                    console.error(err);
                }
            }
        }
    });
}
exports.default = registerPlugins;
const isPluginUpdated = (dbPlugin, scannedPlugin) => {
    return (scannedPlugin.name !== dbPlugin.name ||
        scannedPlugin.description !== dbPlugin.description ||
        scannedPlugin.path !== dbPlugin.path ||
        !isEqual(scannedPlugin.required_parameters, dbPlugin.required_parameters) ||
        !isEqual(scannedPlugin.optional_parameters, dbPlugin.optional_parameters) ||
        !isEqual(scannedPlugin.output_properties, dbPlugin.output_properties));
};
//# sourceMappingURL=registerPlugins.js.map