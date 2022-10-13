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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUpPreviewFiles = exports.triggerScheduledActions = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const config_1 = __importDefault(require("../../config"));
const luxon_1 = require("luxon");
// Dev config option
const schedulerTestMode = false; // Runs scheduler every 30 seconds
// Node-scheduler to run scheduled actions periodically
const checkActionSchedule = schedulerTestMode
    ? { second: [0, 30] }
    : {
        hour: (_a = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.hoursSchedule) !== null && _a !== void 0 ? _a : [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
        ],
        minute: 0,
    };
// Node scheduler to clean-up preview files periodically
const cleanUpPreviewsSchedule = schedulerTestMode
    ? { second: [0, 30] }
    : {
        hour: (_b = config_1.default === null || config_1.default === void 0 ? void 0 : config_1.default.previewDocsCleanupSchedule) !== null && _b !== void 0 ? _b : [1],
        minute: 0,
    };
// Launch schedulers
node_schedule_1.default.scheduleJob(checkActionSchedule, () => {
    exports.triggerScheduledActions();
});
node_schedule_1.default.scheduleJob(cleanUpPreviewsSchedule, () => {
    exports.cleanUpPreviewFiles();
});
exports.triggerScheduledActions = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(luxon_1.DateTime.now().toLocaleString(luxon_1.DateTime.DATETIME_SHORT_WITH_SECONDS), 'Checking scheduled actions...');
    databaseConnect_1.default.triggerScheduledActions();
});
exports.cleanUpPreviewFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(luxon_1.DateTime.now().toLocaleString(luxon_1.DateTime.DATETIME_SHORT_WITH_SECONDS), 'Cleaning up preview files...');
    const deleteCount = yield databaseConnect_1.default.cleanUpPreviewFiles();
    if (deleteCount > 0)
        console.log(`${deleteCount} files removed.`);
});
//# sourceMappingURL=scheduler.js.map