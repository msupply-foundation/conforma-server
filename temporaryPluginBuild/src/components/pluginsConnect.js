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
exports.loadActionPlugins = exports.actionSchedule = exports.actionLibrary = void 0;
const actions_1 = require("./actions");
const registerPlugins_1 = __importDefault(require("./registerPlugins"));
// Load action plugins
exports.actionLibrary = {};
exports.actionSchedule = [];
exports.loadActionPlugins = () => __awaiter(void 0, void 0, void 0, function* () {
    // Scan plugins folder and update Database
    yield registerPlugins_1.default();
    // Load Action functions into global scope
    yield actions_1.loadActions(exports.actionLibrary);
    // Launch any overdue scheduled actions
    yield actions_1.triggerScheduledActions();
});
//# sourceMappingURL=pluginsConnect.js.map