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
exports.routeGetApplicationData = exports.routeRunAction = void 0;
const pluginsConnect_1 = require("../pluginsConnect");
const getApplicationData_1 = require("./getApplicationData");
const utilityFunctions_1 = require("../utilityFunctions");
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
exports.routeRunAction = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { actionCode, applicationId, reviewId, parameters } = utilityFunctions_1.combineRequestParams(request, 'camel');
    const applicationData = applicationId ? yield getApplicationData_1.getApplicationData({ applicationId, reviewId }) : {};
    const actionResult = yield pluginsConnect_1.actionLibrary[actionCode]({
        parameters,
        applicationData,
        DBConnect: databaseConnect_1.default,
    });
    return reply.send(actionResult);
});
exports.routeGetApplicationData = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId, reviewId } = utilityFunctions_1.combineRequestParams(request, 'camel');
    const appDataParams = {
        applicationId: Number(applicationId),
    };
    if (reviewId)
        appDataParams.reviewId = Number(reviewId);
    reply.send(yield getApplicationData_1.getApplicationData(appDataParams));
});
//# sourceMappingURL=runActionRoute.js.map