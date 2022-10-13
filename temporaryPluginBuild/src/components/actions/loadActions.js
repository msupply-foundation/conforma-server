"use strict";
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
exports.loadActions = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const utilityFunctions_1 = require("../utilityFunctions");
const path_1 = __importDefault(require("path"));
// Load actions from Database at server startup
exports.loadActions = function (actionLibrary) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Loading Actions from Database...');
        try {
            const result = yield databaseConnect_1.default.getActionPlugins();
            result.forEach((row) => {
                // This should import action from index.js (entry point of plugin)
                actionLibrary[row.code] = require(path_1.default.join(utilityFunctions_1.getAppEntryPointDir(), row.path)).action;
                console.log('Action loaded: ' + row.code);
            });
            console.log('Actions loaded.');
        }
        catch (err) {
            console.log(err.stack);
        }
    });
};
//# sourceMappingURL=loadActions.js.map