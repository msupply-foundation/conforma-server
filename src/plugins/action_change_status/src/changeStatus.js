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
module.exports['changeStatus'] = function (parameters, DBConnect) {
    return __awaiter(this, void 0, void 0, function () {
        var applicationId, reviewId, newStatus;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    applicationId = parameters.applicationId, reviewId = parameters.reviewId, newStatus = parameters.newStatus;
                    if (!applicationId) return [3 /*break*/, 2];
                    return [4 /*yield*/, changeApplicationStatus(applicationId, newStatus, DBConnect)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    if (!reviewId) return [3 /*break*/, 4];
                    return [4 /*yield*/, changeReviewStatus(reviewId, newStatus, DBConnect)];
                case 3: return [2 /*return*/, _a.sent()];
                case 4: return [2 /*return*/, {
                        status: 'Fail',
                        error_log: "Neither applicationId or reviewId is provided, cannot run action",
                    }];
            }
        });
    });
};
var changeApplicationStatus = function (applicationId, newStatus, DBConnect) { return __awaiter(void 0, void 0, void 0, function () {
    var returnObject, currentStatus, currentStageHistoryId, result_1, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                returnObject = { status: null, error_log: '' };
                console.log("Changing the Status of Application " + applicationId + "...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                return [4 /*yield*/, DBConnect.getApplicationCurrentStatusHistory(applicationId)];
            case 2:
                currentStatus = _a.sent();
                if ((currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.status) === newStatus) {
                    // Do nothing
                    console.log("WARNING: Application " + applicationId + " already has status: " + newStatus + ". No changes were made.");
                    returnObject.status = 'Success';
                    returnObject.error_log = 'Status not changed';
                    returnObject.output = { status: newStatus, statusId: currentStatus.id };
                    return [2 /*return*/, returnObject];
                }
                currentStageHistoryId = void 0;
                if (!!(currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.status)) return [3 /*break*/, 4];
                return [4 /*yield*/, DBConnect.getCurrentStageHistory(applicationId)];
            case 3:
                result_1 = _a.sent();
                if (!result_1) {
                    returnObject.status = 'Fail';
                    returnObject.error_log =
                        "No stage defined for this Application. Can't create a status_history record.";
                    return [2 /*return*/, returnObject];
                }
                else
                    currentStageHistoryId = result_1.id;
                return [3 /*break*/, 5];
            case 4:
                currentStageHistoryId = currentStatus.application_stage_history_id;
                _a.label = 5;
            case 5: return [4 /*yield*/, DBConnect.addNewApplicationStatusHistory(currentStageHistoryId, newStatus)];
            case 6:
                result = _a.sent();
                if (result.id) {
                    returnObject.status = 'Success';
                    returnObject.output = { status: newStatus, statusId: result.id };
                    console.log("New status_history created: " + newStatus);
                }
                else {
                    returnObject.status = 'Fail';
                    returnObject.error_log = "Couldn't create new application_status_history";
                    return [2 /*return*/, returnObject];
                }
                // Create output object and return
                returnObject.output = __assign(__assign({}, returnObject.output), { applicationId: applicationId });
                return [2 /*return*/, returnObject];
            case 7:
                err_1 = _a.sent();
                returnObject.status = 'Fail';
                returnObject.error_log = 'Unable to change Status';
                return [2 /*return*/, returnObject];
            case 8: return [2 /*return*/];
        }
    });
}); };
var changeReviewStatus = function (reviewId, newStatus, DBConnect) { return __awaiter(void 0, void 0, void 0, function () {
    var returnObject, currentStatus, result, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                returnObject = { status: null, error_log: '' };
                console.log("Changing the Status of Review " + reviewId + "...");
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, DBConnect.getReviewCurrentStatusHistory(reviewId)];
            case 2:
                currentStatus = _a.sent();
                if ((currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.status) === newStatus) {
                    // Do nothing
                    console.log("WARNING: Review " + reviewId + " already has status: " + newStatus + ". No changes were made.");
                    returnObject.status = 'Success';
                    returnObject.error_log = 'Status not changed';
                    returnObject.output = { status: newStatus, statusId: currentStatus.id };
                    return [2 /*return*/, returnObject];
                }
                return [4 /*yield*/, DBConnect.addNewReviewStatusHistory(reviewId, newStatus)];
            case 3:
                result = _a.sent();
                if (result.id) {
                    returnObject.status = 'Success';
                    returnObject.output = { status: newStatus, statusId: result.id };
                    console.log("New review_status_history created: " + newStatus);
                }
                else {
                    returnObject.status = 'Fail';
                    returnObject.error_log = "Couldn't create new review_status_history";
                    return [2 /*return*/, returnObject];
                }
                // Create output object and return
                returnObject.output = __assign(__assign({}, returnObject.output), { reviewId: reviewId });
                return [2 /*return*/, returnObject];
            case 4:
                err_2 = _a.sent();
                returnObject.status = 'Fail';
                returnObject.error_log = 'Unable to change Status';
                return [2 /*return*/, returnObject];
            case 5: return [2 /*return*/];
        }
    });
}); };
