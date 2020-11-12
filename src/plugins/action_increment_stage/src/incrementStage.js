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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
module.exports['incrementStage'] = function (parameters, DBConnect) {
    return __awaiter(this, void 0, void 0, function () {
        var applicationId, returnObject, templateId, currentStageHistory, currentStageHistoryId, currentStageNum, currentStatus, nextStage, result, newStageHistoryId, newStatusHistory, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    applicationId = parameters.applicationId;
                    returnObject = { status: null, error_log: '' };
                    console.log("Incrementing the Stage for Application " + applicationId + "...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    return [4 /*yield*/, DBConnect.getTemplateIdFromTrigger('application', applicationId)];
                case 2:
                    templateId = _a.sent();
                    console.log('Getting template Id', templateId);
                    return [4 /*yield*/, DBConnect.getCurrentStageHistory(applicationId)];
                case 3:
                    currentStageHistory = _a.sent();
                    currentStageHistoryId = currentStageHistory === null || currentStageHistory === void 0 ? void 0 : currentStageHistory.stage_history_id;
                    currentStageNum = currentStageHistory === null || currentStageHistory === void 0 ? void 0 : currentStageHistory.stage_number;
                    currentStatus = currentStageHistory === null || currentStageHistory === void 0 ? void 0 : currentStageHistory.status;
                    return [4 /*yield*/, DBConnect.getNextStage(templateId, currentStageNum)];
                case 4:
                    nextStage = _a.sent();
                    if (!nextStage) {
                        console.log('WARNING: Application is already at final stage. No changes made.');
                        returnObject.status = 'Success';
                        returnObject.error_log = 'Warning: No changes made';
                        return [2 /*return*/, returnObject];
                    }
                    if (!currentStageHistory) return [3 /*break*/, 6];
                    return [4 /*yield*/, DBConnect.addNewStatusHistory(currentStageHistoryId, 'Completed')];
                case 5:
                    result = _a.sent();
                    if (!result) {
                        returnObject.status = 'Fail';
                        returnObject.error_log = "Couldn't create new status";
                        return [2 /*return*/, returnObject];
                    }
                    _a.label = 6;
                case 6: return [4 /*yield*/, DBConnect.addNewStageHistory(applicationId, nextStage.stage_id)
                    // Create new status_history
                ];
                case 7:
                    newStageHistoryId = _a.sent();
                    return [4 /*yield*/, DBConnect.addNewStatusHistory(newStageHistoryId, currentStatus ? currentStatus : 'Draft')];
                case 8:
                    newStatusHistory = _a.sent();
                    if (!newStageHistoryId || !newStatusHistory) {
                        returnObject.status = 'Fail';
                        returnObject.error_log = 'Problem creating new stage_history or status_history';
                        return [2 /*return*/, returnObject];
                    }
                    returnObject.status = 'Success';
                    returnObject.output = {
                        applicationId: applicationId,
                        stageNumber: nextStage.stage_number,
                        stageName: nextStage.title,
                        stageHistoryId: newStageHistoryId,
                        statusId: newStatusHistory.id,
                        status: newStatusHistory.status,
                    };
                    console.log("Application " + applicationId + " Stage incremented to " + returnObject.output.stageName + ". Status: " + returnObject.output.status);
                    return [2 /*return*/, returnObject];
                case 9:
                    err_1 = _a.sent();
                    console.log(err_1.message);
                    returnObject.status = 'Fail';
                    returnObject.error_log = 'Unable to increment Stage';
                    return [2 /*return*/, returnObject];
                case 10: return [2 /*return*/];
            }
        });
    });
};
