"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const preferences_json_1 = __importDefault(require("../preferences/preferences.json"));
require('dotenv').config();
const package_json_1 = require("../package.json");
const isProductionBuild = process.env.NODE_ENV === 'production';
const serverPrefs = preferences_json_1.default.server;
const config = Object.assign({ pg_database_connection: {
        user: 'postgres',
        host: 'localhost',
        database: 'tmf_app_manager',
        password: '',
        port: 5432,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
    }, version: package_json_1.version, 
    // In production postgraphile is started with -q and -i /postgraphile/...
    graphQLendpoint: isProductionBuild
        ? 'http://localhost:5000/postgraphile/graphql'
        : 'http://localhost:5000/graphql', 
    // 'Folder path from perspective of server.ts/js'
    filesFolder: '../files', pluginsFolder: '../plugins', imagesFolder: '../images', databaseFolder: '../database', localisationsFolder: '../localisation', preferencesFolder: '../preferences', preferencesFileName: 'preferences.json', genericThumbnailsFolderName: '_generic_thumbnails', 
    // In production postgraphile is started with -q and -i /postgraphile/...
    nodeModulesFolder: process.env.NODE_ENV === 'production' ? '../../node_modules' : '../node_modules', jwtSecret: process.env.JWT_SECRET || 'devsecret', RESTport: 8080, dataTablePrefix: 'data_table_', 
    // These are the only default tables in the system that we allow to be mutated
    // directly by modifyRecord or display as data views. All other names must
    // have "data_table_" prepended.
    allowedTableNames: ['user', 'organisation', 'application', 'file'] }, serverPrefs);
exports.default = config;
//# sourceMappingURL=config.js.map