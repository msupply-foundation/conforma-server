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
exports.getApplicationData = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const utilityFunctions_1 = require("../utilityFunctions");
const config_1 = __importDefault(require("../../config"));
// Add more data (such as org/review, etc.) here as required
exports.getApplicationData = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // Requires either application OR trigger_payload, so throw error if neither provided
    if (!((_a = input === null || input === void 0 ? void 0 : input.payload) === null || _a === void 0 ? void 0 : _a.trigger_payload) && !(input === null || input === void 0 ? void 0 : input.applicationId))
        throw new Error('trigger_payload or applicationId required');
    const { trigger_payload } = (_b = input === null || input === void 0 ? void 0 : input.payload) !== null && _b !== void 0 ? _b : {};
    const applicationId = (_c = input === null || input === void 0 ? void 0 : input.applicationId) !== null && _c !== void 0 ? _c : (yield databaseConnect_1.default.getApplicationIdFromTrigger(trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.table, trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.record_id));
    const applicationResult = yield databaseConnect_1.default.getApplicationData(applicationId);
    if (!applicationResult)
        throw new Error("Can't get application data");
    const applicationData = applicationResult ? applicationResult : { applicationId };
    const userData = (applicationData === null || applicationData === void 0 ? void 0 : applicationData.userId) ? yield databaseConnect_1.default.getUserData(applicationData === null || applicationData === void 0 ? void 0 : applicationData.userId, applicationData === null || applicationData === void 0 ? void 0 : applicationData.orgId)
        : null;
    const responses = yield databaseConnect_1.default.getApplicationResponses(applicationId);
    const responseData = {};
    for (const response of responses) {
        responseData[response.code] = response.value;
    }
    const reviewId = (_d = input === null || input === void 0 ? void 0 : input.reviewId) !== null && _d !== void 0 ? _d : ((trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.table) === 'review' ? trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.record_id : null);
    const reviewAssignmentId = (_e = input === null || input === void 0 ? void 0 : input.reviewAssignmentId) !== null && _e !== void 0 ? _e : ((trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.table) === 'review_assignment' ? trigger_payload === null || trigger_payload === void 0 ? void 0 : trigger_payload.record_id : null);
    const reviewData = reviewId
        ? Object.assign({ reviewId }, (yield databaseConnect_1.default.getReviewData(reviewId))) : reviewAssignmentId
        ? Object.assign({}, (yield databaseConnect_1.default.getReviewDataFromAssignment(reviewAssignmentId))) : {};
    const environmentData = {
        appRootFolder: utilityFunctions_1.getAppEntryPointDir(),
        filesFolder: config_1.default.filesFolder,
        webHostUrl: process.env.WEB_HOST,
    };
    const sectionCodes = (yield databaseConnect_1.default.getApplicationSections(applicationId)).map(({ code }) => code);
    return Object.assign(Object.assign(Object.assign({ action_payload: input === null || input === void 0 ? void 0 : input.payload }, applicationData), userData), { responses: responseData, reviewData,
        environmentData,
        sectionCodes });
});
//# sourceMappingURL=getApplicationData.js.map