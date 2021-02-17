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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("./types");
module.exports['generateReviewAssignments'] = function (input, DBConnect) {
    return __awaiter(this, void 0, void 0, function () {
        var applicationId_1, reviewId, templateId, stageId_1, stageNumber_1, numReviewLevels_1, currentReviewLevel, _a, nextReviewLevel_1, nextLevelReviewers, reviewAssignments_1, reviewAssignmentIds, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Generating review assignment records...');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 8, , 9]);
                    applicationId_1 = input.applicationId, reviewId = input.reviewId, templateId = input.templateId, stageId_1 = input.stageId, stageNumber_1 = input.stageNumber;
                    return [4 /*yield*/, DBConnect.getNumReviewLevels(templateId, stageNumber_1)];
                case 2:
                    numReviewLevels_1 = _b.sent();
                    if (!reviewId) return [3 /*break*/, 4];
                    return [4 /*yield*/, DBConnect.getCurrentReviewLevel(reviewId)];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = 0;
                    _b.label = 5;
                case 5:
                    currentReviewLevel = _a;
                    if (currentReviewLevel === numReviewLevels_1) {
                        console.log('Final review level reached for current stage, no later review assignments to generate.');
                        return [2 /*return*/, {}];
                    }
                    nextReviewLevel_1 = currentReviewLevel + 1;
                    return [4 /*yield*/, DBConnect.getReviewersForApplicationStageLevel(templateId, stageNumber_1, nextReviewLevel_1)];
                case 6:
                    nextLevelReviewers = _b.sent();
                    reviewAssignments_1 = {};
                    // Build reviewers into object map so we can combine duplicate user_orgs
                    // and merge their section code restrictions
                    nextLevelReviewers.forEach(function (reviewer) {
                        var _a;
                        var userId = reviewer.user_id, orgId = reviewer.organisation_id, restrictions = reviewer.restrictions;
                        var templateSectionRestrictions = restrictions
                            ? restrictions.templateSectionRestrictions
                            : null;
                        var userOrgKey = userId + "_" + (orgId ? orgId : 0);
                        if (reviewAssignments_1[userOrgKey])
                            reviewAssignments_1[userOrgKey].templateSectionRestrictions = mergeSectionRestrictions((_a = reviewAssignments_1[userOrgKey]) === null || _a === void 0 ? void 0 : _a.templateSectionRestrictions, templateSectionRestrictions);
                        else
                            reviewAssignments_1[userOrgKey] = {
                                reviewerId: userId,
                                orgId: orgId,
                                stageId: stageId_1,
                                stageNumber: stageNumber_1,
                                // TO-DO: allow STATUS to be configurable in template
                                status: nextReviewLevel_1 === 1 ? types_1.AssignmentStatus.AVAILABLE : types_1.AssignmentStatus.SELF_ASSIGN,
                                applicationId: applicationId_1,
                                templateSectionRestrictions: templateSectionRestrictions,
                                level: nextReviewLevel_1,
                                isLastLevel: nextReviewLevel_1 === numReviewLevels_1,
                            };
                    });
                    return [4 /*yield*/, DBConnect.addReviewAssignments(Object.values(reviewAssignments_1))];
                case 7:
                    reviewAssignmentIds = _b.sent();
                    console.log('Review Assignment IDs:', reviewAssignmentIds);
                    return [2 /*return*/, {
                            status: 'Success',
                            error_log: '',
                            output: {
                                reviewAssignments: Object.values(reviewAssignments_1),
                                reviewAssignmentIds: reviewAssignmentIds,
                                currentReviewLevel: currentReviewLevel,
                                nextReviewLevel: nextReviewLevel_1,
                            },
                        }];
                case 8:
                    error_1 = _b.sent();
                    console.log(error_1.message);
                    return [2 /*return*/, {
                            status: 'Fail',
                            error_log: 'Problem creating review_assignment records.',
                        }];
                case 9: return [2 /*return*/];
            }
        });
    });
};
// Helper function -- concatenates two arrays, but handles case
// when either or both are null/undefined
var mergeSectionRestrictions = function (prevArray, newArray) {
    if (!prevArray)
        return newArray;
    else if (!newArray)
        return prevArray;
    else
        return __spreadArrays(prevArray, newArray);
};
