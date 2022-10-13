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
exports.executeAction = void 0;
const expression_evaluator_1 = __importDefault(require("@openmsupply/expression-evaluator"));
const lodash_1 = require("lodash");
const evaluatorFunctions_1 = __importDefault(require("./evaluatorFunctions"));
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const getApplicationData_1 = require("./getApplicationData");
const graphql_1 = require("../../generated/graphql");
const config_1 = __importDefault(require("../../config"));
const helpers_1 = require("./helpers");
const loginHelpers_1 = require("../permissions/loginHelpers");
// Dev config
const showApplicationDataLog = false;
const graphQLEndpoint = config_1.default.graphQLendpoint;
function executeAction(payload, actionLibrary, additionalObjects = {}, applicationDataOverride) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        // Get fresh applicationData for each Action, and inject
        // applicationDataOverride if present
        const applicationData = lodash_1.merge(yield getApplicationData_1.getApplicationData({ payload }), applicationDataOverride);
        // Debug helper console.log to inspect applicationData:
        if (showApplicationDataLog)
            console.log('ApplicationData: ', applicationData);
        const evaluatorParams = {
            objects: Object.assign({ applicationData, functions: evaluatorFunctions_1.default }, additionalObjects),
            pgConnection: databaseConnect_1.default,
            APIfetch: node_fetch_1.default,
            graphQLConnection: { fetch: node_fetch_1.default, endpoint: graphQLEndpoint },
            headers: {
                Authorization: `Bearer ${yield loginHelpers_1.getAdminJWT()}`,
            },
        };
        // Evaluate condition
        let condition;
        try {
            condition = yield expression_evaluator_1.default(payload.condition_expression, evaluatorParams);
        }
        catch (err) {
            console.log('>> Error evaluating condition for action:', payload.code);
            const actionResult = {
                status: graphql_1.ActionQueueStatus.Fail,
                error_log: 'Problem evaluating condition: ' + err,
                parameters_evaluated: null,
                output: null,
                id: payload.id,
            };
            yield databaseConnect_1.default.executedActionStatusUpdate(actionResult);
            return actionResult;
        }
        if (!condition) {
            console.log(payload.code + ': Condition not met');
            return yield databaseConnect_1.default.executedActionStatusUpdate({
                status: graphql_1.ActionQueueStatus.ConditionNotMet,
                error_log: '',
                parameters_evaluated: null,
                output: null,
                id: payload.id,
            });
        }
        // Condition met -- executing now...
        try {
            // Evaluate parameters
            const parametersEvaluated = yield helpers_1.evaluateParameters(payload.parameter_queries, evaluatorParams);
            // TO-DO: Check all required parameters are present
            // TO-DO: If Scheduled, create a Job instead
            const actionResult = yield actionLibrary[payload.code]({
                parameters: parametersEvaluated,
                applicationData,
                outputCumulative: ((_a = evaluatorParams.objects) === null || _a === void 0 ? void 0 : _a.outputCumulative) || {},
                DBConnect: databaseConnect_1.default,
            });
            return yield databaseConnect_1.default.executedActionStatusUpdate({
                status: actionResult.status,
                error_log: actionResult.error_log,
                parameters_evaluated: parametersEvaluated,
                output: actionResult.output,
                id: payload.id,
            });
        }
        catch (err) {
            console.error('>> Error executing action:', payload.code);
            yield databaseConnect_1.default.executedActionStatusUpdate({
                status: graphql_1.ActionQueueStatus.Fail,
                error_log: "Couldn't execute Action: " + err.message,
                parameters_evaluated: null,
                output: null,
                id: payload.id,
            });
            throw err;
        }
    });
}
exports.executeAction = executeAction;
//# sourceMappingURL=executeAction.js.map