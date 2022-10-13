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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDisplayData = exports.routePreviewActions = void 0;
const utilityFunctions_1 = require("../utilityFunctions");
const processTrigger_1 = require("./processTrigger");
const graphql_1 = require("../../generated/graphql");
exports.routePreviewActions = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId, reviewId, applicationDataOverride } = utilityFunctions_1.combineRequestParams(request, 'camel');
    // A dummy triggerPayload object, as though it was retrieved from the
    // trigger_queue table
    const triggerPayload = {
        trigger_id: null,
        trigger: graphql_1.Trigger.OnPreview,
        table: reviewId ? 'review' : 'application',
        record_id: reviewId ? Number(reviewId) : Number(applicationId),
        applicationDataOverride,
    };
    const actionsOutput = yield processTrigger_1.processTrigger(triggerPayload);
    const displayData = exports.createDisplayData(actionsOutput);
    return reply.send({ displayData, actionsOutput });
});
// Convert the full action output into a simplified format that can be easily
// displayed by the front-end Preview module
exports.createDisplayData = (actionsOutput) => {
    return actionsOutput.map((result) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        switch (result.action) {
            case 'sendNotification':
                return {
                    type: 'NOTIFICATION',
                    status: result.status,
                    displayString: (_c = (_b = (_a = result.output) === null || _a === void 0 ? void 0 : _a.notification) === null || _b === void 0 ? void 0 : _b.subject) !== null && _c !== void 0 ? _c : 'Email notification',
                    text: (_e = (_d = result.output) === null || _d === void 0 ? void 0 : _d.notification) === null || _e === void 0 ? void 0 : _e.message,
                    errorLog: result.errorLog,
                };
            case 'generateDoc':
                return {
                    type: 'DOCUMENT',
                    status: result.status,
                    displayString: (_l = (_h = (_g = (_f = result.output) === null || _f === void 0 ? void 0 : _f.document) === null || _g === void 0 ? void 0 : _g.description) !== null && _h !== void 0 ? _h : (_k = (_j = result.output) === null || _j === void 0 ? void 0 : _j.document) === null || _k === void 0 ? void 0 : _k.filename) !== null && _l !== void 0 ? _l : 'Generated Document',
                    fileId: (_o = (_m = result.output) === null || _m === void 0 ? void 0 : _m.document) === null || _o === void 0 ? void 0 : _o.uniqueId,
                    errorLog: result.errorLog,
                };
            // We're only expecting preview results from sendNotification and generateDoc actions. Fallback for others:
            default:
                return {
                    type: 'OTHER',
                    status: result.status,
                    displayString: `Output of action: ${result.action}`,
                    text: JSON.stringify(result.output, null, 2),
                    errorLog: result.errorLog,
                };
        }
    });
};
//# sourceMappingURL=previewActionsRoute.js.map