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
exports.processTrigger = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const pluginsConnect_1 = require("../pluginsConnect");
const executeAction_1 = require("./executeAction");
const graphql_1 = require("../../generated/graphql");
const helpers_1 = require("./helpers");
// Dev config
const showActionOutcomeLog = false;
function processTrigger(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { trigger_id, trigger, table, record_id, data, event_code, applicationDataOverride } = payload;
        const templateId = yield databaseConnect_1.default.getTemplateIdFromTrigger(payload.table, payload.record_id);
        // Get Actions from matching Template (and match templateActionCode if applicable)
        const actions = (yield databaseConnect_1.default.getActionsByTemplateId(templateId, trigger))
            .filter((action) => {
            if (!event_code)
                return true;
            else
                return action.event_code === event_code;
        })
            .map((action) => (action.code !== 'alias' ? action : helpers_1.swapOutAliasedAction(templateId, action)));
        // .filter/.map runs each loop async, so need to wait for them all to finish
        const resolvedActions = yield Promise.all(actions);
        // Separate into Sequential and Async actions
        const actionsSequential = resolvedActions.filter(({ sequence }) => !!sequence);
        const actionsAsync = resolvedActions.filter(({ sequence }) => !sequence);
        for (const action of [...actionsAsync, ...actionsSequential]) {
            // Add all actions to Action Queue
            yield databaseConnect_1.default.addActionQueue({
                trigger_event: trigger_id,
                trigger_payload: payload,
                template_id: templateId,
                sequence: action.sequence,
                action_code: action.code,
                parameter_queries: action.parameter_queries,
                parameters_evaluated: {},
                condition_expression: action.condition,
                status: typeof action.sequence === 'number'
                    ? graphql_1.ActionQueueStatus.Processing
                    : graphql_1.ActionQueueStatus.Queued,
            });
        }
        if (trigger_id)
            yield databaseConnect_1.default.updateTriggerQueueStatus({
                status: graphql_1.TriggerQueueStatus.ActionsDispatched,
                id: trigger_id,
            });
        // Get sequential Actions from database (Async actions are handled directly by
        // pg_notify -- see listeners in postgresConnect.ts)
        const actionsToExecute = yield databaseConnect_1.default.getActionsProcessing(templateId);
        // Collect output properties of actions in sequence
        // "data" is stored output from scheduled triggers or verifications
        let outputCumulative = Object.assign({}, data === null || data === void 0 ? void 0 : data.outputCumulative);
        // Result collection to send back to preview endpoint
        // (but could be used elsewhere if required)
        const actionOutputs = [];
        // Execute sequential Actions one by one
        let actionFailed = '';
        for (const action of actionsToExecute) {
            if (actionFailed) {
                yield databaseConnect_1.default.executedActionStatusUpdate({
                    status: graphql_1.ActionQueueStatus.Fail,
                    error_log: 'Action cancelled due to failure of previous sequential action: ' + actionFailed,
                    parameters_evaluated: null,
                    output: null,
                    id: action.id,
                });
                continue;
            }
            try {
                const actionPayload = {
                    id: action.id,
                    code: action.action_code,
                    condition_expression: action.condition_expression,
                    parameter_queries: action.parameter_queries,
                    trigger_payload: action.trigger_payload,
                };
                const result = yield executeAction_1.executeAction(actionPayload, pluginsConnect_1.actionLibrary, {
                    outputCumulative,
                }, applicationDataOverride);
                outputCumulative = Object.assign(Object.assign({}, outputCumulative), result.output);
                if (result.status !== graphql_1.ActionQueueStatus.ConditionNotMet)
                    actionOutputs.push({
                        action: action.action_code,
                        status: result.status,
                        output: result.output,
                        errorLog: result.error_log ? result.error_log : null,
                    });
                // Debug helper console.log to inspect action outputs:
                if (showActionOutcomeLog)
                    console.log('outputCumulative:', outputCumulative);
                if (result.status === graphql_1.ActionQueueStatus.Fail) {
                    console.log(result.error_log);
                    actionFailed = action.action_code;
                }
            }
            catch (err) {
                actionFailed = action.action_code;
            }
        }
        // After all done, set Trigger on table back to NULL (or Error)
        yield databaseConnect_1.default.resetTrigger(table, record_id, actionFailed !== '');
        // and set is_active = false if scheduled action
        if (table === 'trigger_schedule' && actionFailed === '')
            yield databaseConnect_1.default.setScheduledActionDone(table, record_id);
        // and set trigger_queue status to "COMPLETED"
        if (trigger_id)
            yield databaseConnect_1.default.updateTriggerQueueStatus({
                status: actionFailed ? graphql_1.TriggerQueueStatus.Error : graphql_1.TriggerQueueStatus.Completed,
                id: trigger_id,
            });
        // Return value only used by Previews endpoint
        return actionOutputs;
    });
}
exports.processTrigger = processTrigger;
//# sourceMappingURL=processTrigger.js.map