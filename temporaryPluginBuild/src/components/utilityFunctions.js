"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidTableName = exports.capitaliseFirstLetter = exports.filterObject = exports.getDistinctObjects = exports.makeFolder = exports.combineRequestParams = exports.objectKeysToSnakeCase = exports.objectKeysToCamelCase = exports.getAppEntryPointDir = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const pluralize_1 = require("pluralize");
const config_1 = __importDefault(require("../config"));
// Determines the folder of the main entry file, as opposed to the
// project root. Needed for components that traverse the local directory
// structure (e.g. fileHandler, registerPlugins), as the project
// root changes its relative path once built.
function getAppEntryPointDir() {
    return path_1.default.dirname(__dirname);
}
exports.getAppEntryPointDir = getAppEntryPointDir;
// Convert object keys to camelCase
exports.objectKeysToCamelCase = (obj) => lodash_1.mapKeys(obj, (_, key) => lodash_1.camelCase(key));
// Convert object keys to snake_case
exports.objectKeysToSnakeCase = (obj) => lodash_1.mapKeys(obj, (_, key) => lodash_1.snakeCase(key));
// Combine both query parameters and Body JSON fields from http request
// into single object
// Note: Body parameters take precedence
exports.combineRequestParams = (request, outputCase = null) => {
    const query = request.query;
    const bodyJSON = request.body;
    if (outputCase === 'snake')
        return exports.objectKeysToSnakeCase(Object.assign(Object.assign({}, query), bodyJSON));
    if (outputCase === 'camel')
        return exports.objectKeysToCamelCase(Object.assign(Object.assign({}, query), bodyJSON));
    return Object.assign(Object.assign({}, query), bodyJSON);
};
// Create folder if it doesn't already exist
exports.makeFolder = (folderPath, message) => {
    if (!fs_1.default.existsSync(folderPath)) {
        message && console.log(message);
        fs_1.default.mkdirSync(folderPath);
    }
};
exports.getDistinctObjects = (objectArray, matchProperty, priorityProperty = null) => {
    const distinctValues = new Set();
    const highestPriorityIndexRecord = {};
    const outputArray = [];
    objectArray.forEach((item) => {
        if (!(matchProperty in item))
            throw new Error('matchProperty not found on Object');
        const value = item[matchProperty];
        if (!distinctValues.has(value)) {
            distinctValues.add(value);
            const index = outputArray.push(item) - 1;
            highestPriorityIndexRecord[JSON.stringify(value)] = index;
        }
        else {
            if (!priorityProperty)
                return;
            // Is the new one higher?
            const prevIndex = highestPriorityIndexRecord[JSON.stringify(value)];
            if ((item === null || item === void 0 ? void 0 : item[priorityProperty]) > outputArray[prevIndex][priorityProperty])
                outputArray[prevIndex] = item;
        }
    });
    return outputArray;
};
exports.filterObject = (inputObj, filterFunction = (x) => x != null) => {
    const filtered = Object.entries(inputObj).filter(([_, value]) => filterFunction(value));
    return Object.fromEntries(filtered);
};
exports.capitaliseFirstLetter = (str) => str[0].toUpperCase() + str.slice(1);
// The only tables in the system that we allow to be mutated directly by
// modifyRecord or displayed as data views. All other names must have
// "data_table_" prepended.
const DATA_TABLE_PREFIX = config_1.default.dataTablePrefix;
const ALLOWED_TABLE_NAMES = config_1.default.allowedTableNames;
exports.getValidTableName = (inputName) => {
    if (!inputName)
        throw new Error('Missing table name');
    if (ALLOWED_TABLE_NAMES.includes(inputName))
        return inputName;
    const tableName = lodash_1.snakeCase(pluralize_1.singular(inputName));
    const namePattern = new RegExp(`^${DATA_TABLE_PREFIX}.+`);
    return namePattern.test(tableName) ? tableName : `${DATA_TABLE_PREFIX}${tableName}`;
};
//# sourceMappingURL=utilityFunctions.js.map