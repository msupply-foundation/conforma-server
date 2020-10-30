"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function () {
        var applicationId, returnObject, templateId, allStages, maxStageNumber, currentStageHistory, currentStageHistoryId, currentStageId_1, currentStageNum, stageIsMax, newStageNum_1, newStageId, newStageHistoryId, _e, currentStatus, result, newStatus, stageName, err_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    applicationId = parameters.applicationId;
                    returnObject = { status: null, error_log: '' };
                    console.log("Incrementing the Stage for Application " + applicationId + "...");
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 13, , 14]);
                    return [4 /*yield*/, DBConnect.getTemplateId('application', applicationId)];
                case 2:
                    templateId = _f.sent();
                    return [4 /*yield*/, DBConnect.getTemplateStages(templateId)];
                case 3:
                    allStages = _f.sent();
                    maxStageNumber = Math.max.apply(Math, allStages.map(function (stage) { return stage.number; }));
                    return [4 /*yield*/, DBConnect.getCurrentStageHistory(applicationId)];
                case 4:
                    currentStageHistory = _f.sent();
                    currentStageHistoryId = currentStageHistory === null || currentStageHistory === void 0 ? void 0 : currentStageHistory.id;
                    currentStageId_1 = currentStageHistory === null || currentStageHistory === void 0 ? void 0 : currentStageHistory.stage_id;
                    currentStageNum = (_a = allStages.find(function (stage) { return stage.id === currentStageId_1; })) === null || _a === void 0 ? void 0 : _a.number;
                    stageIsMax = currentStageNum === maxStageNumber;
                    if (stageIsMax)
                        console.log('WARNING: Application is already at final stage. No changes made.');
                    newStageNum_1 = currentStageNum
                        ? currentStageNum + 1 <= maxStageNumber
                            ? currentStageNum + 1
                            : currentStageNum
                        : 1;
                    newStageId = (_b = allStages.find(function (stage) { return stage.number === newStageNum_1; })) === null || _b === void 0 ? void 0 : _b.id;
                    if (!stageIsMax) return [3 /*break*/, 5];
                    _e = currentStageHistoryId;
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, DBConnect.addNewStageHistory(applicationId, newStageId)
                    // Update Status_history -- either create new Draft, or relink existing
                ];
                case 6:
                    _e = _f.sent();
                    _f.label = 7;
                case 7:
                    newStageHistoryId = _e;
                    return [4 /*yield*/, DBConnect.getCurrentStatusFromStageHistoryId(currentStageHistoryId)];
                case 8:
                    currentStatus = _f.sent();
                    if (!currentStatus) return [3 /*break*/, 10];
                    return [4 /*yield*/, DBConnect.relinkStatusHistory(currentStatus.id, newStageHistoryId)];
                case 9:
                    result = _f.sent();
                    if (result) {
                        returnObject.output = { currentStatus: currentStatus.status, statusId: currentStatus.id };
                    }
                    else {
                        returnObject.status = 'Fail';
                        returnObject.error_log = "Couldn't relink existing status";
                    }
                    return [3 /*break*/, 12];
                case 10:
                    // create new Draft status
                    console.log('No existing status');
                    return [4 /*yield*/, DBConnect.addNewStatusHistory(newStageHistoryId)];
                case 11:
                    newStatus = _f.sent();
                    if (newStatus) {
                        returnObject.output = { currentStatus: newStatus.status, statusId: newStatus.id };
                    }
                    else {
                        returnObject.status = 'Fail';
                        returnObject.error_log = "Couldn't create new status";
                    }
                    _f.label = 12;
                case 12:
                    if (returnObject.status !== 'Fail') {
                        stageName = (_c = allStages.find(function (stage) { return stage.number === newStageNum_1; })) === null || _c === void 0 ? void 0 : _c.title;
                        console.log("Application Stage: " + stageName + ", Status: " + ((_d = returnObject === null || returnObject === void 0 ? void 0 : returnObject.output) === null || _d === void 0 ? void 0 : _d.currentStatus));
                        returnObject.status = 'Success';
                        returnObject.output = __assign(__assign({}, returnObject.output), { applicationId: applicationId, stageNumber: newStageNum_1, stageName: stageName, stageHistoryId: newStageHistoryId });
                    }
                    return [2 /*return*/, returnObject];
                case 13:
                    err_1 = _f.sent();
                    console.log('Unable to increment Stage');
                    console.log(err_1.message);
                    returnObject.status = 'Fail';
                    returnObject.error_log = 'Unable to increment Stage';
                    return [2 /*return*/, returnObject];
                case 14: return [2 /*return*/];
            }
        });
    });
};
