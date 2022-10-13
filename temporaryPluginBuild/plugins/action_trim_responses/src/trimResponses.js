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
const databaseMethods_1 = __importDefault(require("./databaseMethods"));
const graphql_1 = require("../../../src/generated/graphql");
const isEqual = require('deep-equal');
const trimResponses = ({ parameters, applicationData, DBConnect }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const db = databaseMethods_1.default(DBConnect);
    const applicationId = (_a = parameters === null || parameters === void 0 ? void 0 : parameters.applicationId) !== null && _a !== void 0 ? _a : applicationData === null || applicationData === void 0 ? void 0 : applicationData.applicationId;
    const reviewId = (_b = parameters === null || parameters === void 0 ? void 0 : parameters.reviewId) !== null && _b !== void 0 ? _b : (_c = applicationData === null || applicationData === void 0 ? void 0 : applicationData.reviewData) === null || _c === void 0 ? void 0 : _c.reviewId;
    console.log(`Trimming unchanged duplicated ${reviewId ? 'Review' : 'Application'} responses...`);
    try {
        // Get ALL responses associated with application OR review
        const responses = reviewId
            ? yield DBConnect.getAllReviewResponses(reviewId)
            : yield DBConnect.getAllApplicationResponses(applicationId);
        const reviewLevel = (_d = responses === null || responses === void 0 ? void 0 : responses[0]) === null || _d === void 0 ? void 0 : _d.level_number;
        // Create object of indexed responses, with array of response
        // objects for each indexed id
        const groupByField = !reviewId
            ? 'template_element_id'
            : reviewLevel > 1
                ? 'review_response_link_id'
                : 'application_response_id';
        const responsesById = groupResponses(responses, groupByField);
        const responsesToDelete = [];
        // Calculate review and application responses that should be deleted
        Object.values(responsesById).forEach((responseArray) => {
            var _a;
            const latestResponse = responseArray[responseArray.length - 1];
            const previousResponse = responseArray.length > 1 ? responseArray[responseArray.length - 2] : null;
            if ((previousResponse !== null && isEqual(latestResponse.value, previousResponse === null || previousResponse === void 0 ? void 0 : previousResponse.value)) ||
                // Application Responses
                (latestResponse.value === null && latestResponse.is_reviewable !== graphql_1.Reviewability.Always) ||
                // Review responses
                ((_a = latestResponse.value) === null || _a === void 0 ? void 0 : _a.decision) === null)
                responsesToDelete.push(latestResponse.id);
        });
        // For both application and reviewer level 1 we update latestResponses for template element
        // (note, trimmed responses won't be updated as they will not exist)
        // Don't need to re-group for application
        const groupedResponsesForUpdate = !reviewId
            ? responsesById
            : groupResponses(responses, 'template_element_id');
        const responsesToUpdate = Object.values(groupedResponsesForUpdate).map((responseArray) => responseArray[responseArray.length - 1].id);
        // Run delete operation on all in toDelete array (new method)
        const deletedResponses = reviewId
            ? yield db.deleteReviewResponses(responsesToDelete)
            : yield db.deleteApplicationResponses(responsesToDelete);
        // Update timestamp of remaining responses (based on review/application latest status change timestamp)
        const updatedResponses = reviewId
            ? yield db.updateReviewResponseSubmittedTimestamps(responsesToUpdate, reviewId)
            : yield db.updateApplicationResponseSubmittedTimestamps(responsesToUpdate, applicationId);
        console.log(`Deleted ${reviewId ? 'review' : 'application'} responses: `, deletedResponses);
        console.log(`Updated ${reviewId ? 'review' : 'application'} responses: `, updatedResponses);
        return {
            status: graphql_1.ActionQueueStatus.Success,
            error_log: '',
            output: {
                deletedResponses,
                updatedResponses,
            },
        };
    }
    catch (error) {
        console.log(error.message);
        return {
            status: graphql_1.ActionQueueStatus.Fail,
            error_log: 'There was a problem trimming duplicated responses.',
        };
    }
});
function groupResponses(responses, groupField) {
    const responsesGrouped = {};
    for (const response of responses) {
        const id = response[groupField];
        if (!id)
            continue;
        if (groupField === 'application_response_id' || groupField === 'review_response_link_id')
            response.value = { comment: response.comment, decision: response.decision };
        if (!(id in responsesGrouped))
            responsesGrouped[id] = [response];
        else
            responsesGrouped[id].push(response);
    }
    return responsesGrouped;
}
exports.default = trimResponses;
//# sourceMappingURL=trimResponses.js.map