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
const postgresConnect_1 = __importDefault(require("./postgresConnect"));
const graphQLConnect_1 = __importDefault(require("./graphQLConnect"));
class DBConnect {
    constructor() {
        this.query = postgresConnect_1.default.query;
        this.end = postgresConnect_1.default.end;
        this.getValuesPlaceholders = postgresConnect_1.default.getValuesPlaceholders;
        this.getCounter = postgresConnect_1.default.getCounter;
        this.addActionQueue = postgresConnect_1.default.addActionQueue;
        this.executedActionStatusUpdate = postgresConnect_1.default.executedActionStatusUpdate;
        this.getActionsProcessing = postgresConnect_1.default.getActionsProcessing;
        this.updateActionParametersEvaluated = postgresConnect_1.default.updateActionParametersEvaluated;
        this.getScheduledEvent = postgresConnect_1.default.getScheduledEvent;
        this.updateScheduledEventTime = postgresConnect_1.default.updateScheduledEventTime;
        this.triggerScheduledActions = postgresConnect_1.default.triggerScheduledActions;
        this.resetTrigger = postgresConnect_1.default.resetTrigger;
        this.addTriggerEvent = postgresConnect_1.default.addTriggerEvent;
        this.setScheduledActionDone = postgresConnect_1.default.setScheduledActionDone;
        this.addFile = postgresConnect_1.default.addFile;
        this.updateFileDescription = postgresConnect_1.default.updateFileDescription;
        this.getFileDownloadInfo = postgresConnect_1.default.getFileDownloadInfo;
        this.cleanUpPreviewFiles = postgresConnect_1.default.cleanUpPreviewFiles;
        this.addActionPlugin = postgresConnect_1.default.addActionPlugin;
        this.deleteActionPlugin = postgresConnect_1.default.deleteActionPlugin;
        this.getActionPlugins = postgresConnect_1.default.getActionPlugins;
        this.getActionsByTemplateId = postgresConnect_1.default.getActionsByTemplateId;
        this.getSingleTemplateAction = postgresConnect_1.default.getSingleTemplateAction;
        this.updateActionPlugin = postgresConnect_1.default.updateActionPlugin;
        this.updateTriggerQueueStatus = postgresConnect_1.default.updateTriggerQueueStatus;
        this.getVerification = postgresConnect_1.default.getVerification;
        this.setVerification = postgresConnect_1.default.setVerification;
        this.addUserOrg = postgresConnect_1.default.addUserOrg;
        this.removeUserOrg = postgresConnect_1.default.removeUserOrg;
        this.deleteUserOrgPermissions = postgresConnect_1.default.deleteUserOrgPermissions;
        this.isUnique = postgresConnect_1.default.isUnique;
        this.setApplicationOutcome = postgresConnect_1.default.setApplicationOutcome;
        this.getApplicationData = postgresConnect_1.default.getApplicationData;
        this.getApplicationIdFromTrigger = postgresConnect_1.default.getApplicationIdFromTrigger;
        this.getTemplateIdFromTrigger = (tableName, record_id) => __awaiter(this, void 0, void 0, function* () {
            let templateId;
            switch (tableName) {
                case 'application':
                case 'review':
                case 'review_assignment':
                case 'verification':
                case 'trigger_schedule':
                    templateId = yield postgresConnect_1.default.getTemplateIdFromTrigger(tableName, record_id);
                    break;
                // TO-DO: Implement these queries once we have more data in database
                // -- will probably be easier using GraphQL
                case 'review_response':
                case 'review_section':
                case 'review_section_assign':
                default:
                    throw new Error('Table name not valid');
            }
            return templateId;
        });
        this.getTemplateStages = postgresConnect_1.default.getTemplateStages;
        this.getCurrentStageStatusHistory = postgresConnect_1.default.getCurrentStageStatusHistory;
        this.getNextStage = postgresConnect_1.default.getNextStage;
        this.addNewStageHistory = postgresConnect_1.default.addNewStageHistory;
        this.getReviewCurrentStatusHistory = postgresConnect_1.default.getReviewCurrentStatusHistory;
        this.addNewApplicationStatusHistory = postgresConnect_1.default.addNewApplicationStatusHistory;
        this.addNewReviewStatusHistory = postgresConnect_1.default.addNewReviewStatusHistory;
        this.getUserData = postgresConnect_1.default.getUserData;
        this.getUserOrgData = postgresConnect_1.default.getUserOrgData;
        this.getApplicationResponses = postgresConnect_1.default.getApplicationResponses;
        this.getSystemOrgTemplatePermissions = postgresConnect_1.default.getSystemOrgTemplatePermissions;
        this.getUserTemplatePermissions = postgresConnect_1.default.getUserTemplatePermissions;
        this.getOrgTemplatePermissions = postgresConnect_1.default.getOrgTemplatePermissions;
        this.getAllPermissions = postgresConnect_1.default.getAllPermissions;
        this.getTemplatePermissions = postgresConnect_1.default.getTemplatePermissions;
        this.getAllGeneratedRowPolicies = postgresConnect_1.default.getAllGeneratedRowPolicies;
        this.getUserOrgPermissionNames = postgresConnect_1.default.getUserOrgPermissionNames;
        this.getNumReviewLevels = postgresConnect_1.default.getNumReviewLevels;
        this.getReviewStageAndLevel = postgresConnect_1.default.getReviewStageAndLevel;
        // public isFullyAssignedLevel1 = PostgresDB.isFullyAssignedLevel1
        this.getAllApplicationResponses = postgresConnect_1.default.getAllApplicationResponses;
        this.getAllReviewResponses = postgresConnect_1.default.getAllReviewResponses;
        this.getDatabaseInfo = postgresConnect_1.default.getDatabaseInfo;
        this.getAllTableNames = postgresConnect_1.default.getAllTableNames;
        this.getDataTableColumns = postgresConnect_1.default.getDataTableColumns;
        this.getPermissionPolicies = postgresConnect_1.default.getPermissionPolicies;
        this.getAllowedDataViews = postgresConnect_1.default.getAllowedDataViews;
        this.getDataViewColumnDefinitions = postgresConnect_1.default.getDataViewColumnDefinitions;
        this.getApplicationSections = postgresConnect_1.default.getApplicationSections;
        this.getLatestSnapshotName = postgresConnect_1.default.getLatestSnapshotName;
        this.waitForDatabaseValue = postgresConnect_1.default.waitForDatabaseValue;
        // GraphQL
        this.gqlQuery = graphQLConnect_1.default.gqlQuery;
        this.getReviewData = graphQLConnect_1.default.getReviewData;
        this.getReviewDataFromAssignment = graphQLConnect_1.default.getReviewDataFromAssignment;
        this.isInternalOrg = graphQLConnect_1.default.isInternalOrg;
        this.getAllApplicationTriggers = graphQLConnect_1.default.getAllApplicationTriggers;
        this.getTemplatePermissionsFromApplication = graphQLConnect_1.default.getTemplatePermissionsFromApplication;
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
const dbConnectInstance = DBConnect.Instance;
exports.default = dbConnectInstance;
//# sourceMappingURL=databaseConnect.js.map