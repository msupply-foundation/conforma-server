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
exports.routeExtendApplication = void 0;
const utilityFunctions_1 = require("../utilityFunctions");
const graphql_1 = require("../../generated/graphql");
const luxon_1 = require("luxon");
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const helpers_1 = require("../data_display/helpers");
exports.routeExtendApplication = (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId, eventCode, extensionTime, data } = utilityFunctions_1.combineRequestParams(request, 'camel');
    // Check permissions first -- currently we just check user has ANY Reviewing
    // permissions for current template.
    // TO-DO: define specific permission names required for extending deadlines
    const { permissionNames: userPermissions } = yield helpers_1.getPermissionNamesFromJWT(request);
    const templatePermissions = (yield databaseConnect_1.default.getTemplatePermissionsFromApplication(Number(applicationId)))
        .filter((permission) => { var _a, _b; return ((_b = (_a = permission === null || permission === void 0 ? void 0 : permission.permissionName) === null || _a === void 0 ? void 0 : _a.permissionPolicy) === null || _b === void 0 ? void 0 : _b.type) === graphql_1.PermissionPolicyType.Review; })
        .map((permission) => { var _a; return (_a = permission === null || permission === void 0 ? void 0 : permission.permissionName) === null || _a === void 0 ? void 0 : _a.name; });
    const hasPermission = userPermissions.some((permission) => templatePermissions.includes(permission));
    if (!hasPermission)
        return reply.send({ success: false, message: 'Unauthorized' });
    const { userId } = request.auth;
    try {
        const event = yield databaseConnect_1.default.getScheduledEvent(applicationId, eventCode);
        if (!event)
            return reply.send({ success: false, message: 'No matching event found' });
        // If time is a number, we consider it as number of days. Otherwise a Luxon
        // duration object can be provided for more specificity
        const duration = isNaN(Number(extensionTime)) ? extensionTime : { days: Number(extensionTime) };
        // If event is in the past, we add the duration to the current time,
        // otherwise we add it to the scheduled event time
        const currentScheduledTime = luxon_1.DateTime.fromJSDate(event.time_scheduled);
        const scheduledTime = currentScheduledTime < luxon_1.DateTime.now()
            ? luxon_1.DateTime.now().plus(duration).toISO()
            : currentScheduledTime.plus(duration).toISO();
        // Update trigger schedule event
        const extensionResult = yield databaseConnect_1.default.updateScheduledEventTime(applicationId, eventCode, scheduledTime, userId);
        // Add trigger event directly to trigger_queue so we can include eventCode
        // and any additional data
        const triggerQueueId = yield databaseConnect_1.default.addTriggerEvent({
            trigger: graphql_1.Trigger.OnExtend,
            table: 'application',
            recordId: applicationId,
            eventCode,
            data,
        });
        const triggerStatus = yield databaseConnect_1.default.waitForDatabaseValue({
            table: 'trigger_queue',
            column: 'status',
            waitValue: graphql_1.TriggerQueueStatus.Completed,
            errorValue: graphql_1.TriggerQueueStatus.Error,
            matchColumn: 'id',
            matchValue: triggerQueueId,
        });
        return reply.send({
            success: true,
            newDeadline: extensionResult.time_scheduled,
            actionsResult: triggerStatus,
        });
    }
    catch (err) {
        return { success: false, message: err.message };
    }
});
//# sourceMappingURL=extendApplicationRoute.js.map