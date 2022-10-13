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
const databaseMethods = (DBConnect) => ({
    deleteApplicationResponses: (responsesToDelete) => __awaiter(void 0, void 0, void 0, function* () {
        const text = `DELETE from application_response
      WHERE id = ANY ($1)
      RETURNING id AS "applicationResponseId",
      template_element_id AS "templateElementId"
      `;
        try {
            const result = yield DBConnect.query({ text, values: [responsesToDelete] });
            return result.rows;
        }
        catch (err) {
            console.log(err.message);
            throw err;
        }
    }),
    deleteReviewResponses: (responsesToDelete) => __awaiter(void 0, void 0, void 0, function* () {
        const text = `DELETE from review_response
      WHERE id = ANY ($1)
      RETURNING id AS "reviewResponseId",
      template_element_id AS "templateElementId"
      `;
        try {
            const result = yield DBConnect.query({ text, values: [responsesToDelete] });
            return result.rows;
        }
        catch (err) {
            console.log(err.message);
            throw err;
        }
    }),
    // use applicationId for time_submitted timestamp from latest application_stage_status_latest
    updateApplicationResponseSubmittedTimestamps: (responsesToUpdate, applicationId) => __awaiter(void 0, void 0, void 0, function* () {
        const text = `UPDATE application_response
      SET time_submitted = (select status_history_time_created from application_stage_status_latest where application_id = $1)
      WHERE id = ANY ($2)
      RETURNING id AS "applicationResponseId",
      template_element_id AS "templateElementId"
      `;
        try {
            const result = yield DBConnect.query({ text, values: [applicationId, responsesToUpdate] });
            return result.rows;
        }
        catch (err) {
            console.log(err.message);
            throw err;
        }
    }),
    // use reviewId for time_submitted timestamp from latest review_status_history
    updateReviewResponseSubmittedTimestamps: (responsesToUpdate, reviewId) => __awaiter(void 0, void 0, void 0, function* () {
        const text = `UPDATE review_response
      SET time_submitted = (select time_created from review_status_history where review_id = $1 and is_current = true)
      WHERE id = ANY ($2)
      RETURNING 
        id AS "reviewResponseId",
        decision AS "reviewResponseDecision",
        template_element_id AS "templateElementId"
      `;
        try {
            const result = yield DBConnect.query({ text, values: [reviewId, responsesToUpdate] });
            return result.rows;
        }
        catch (err) {
            console.log(err.message);
            throw err;
        }
    }),
});
exports.default = databaseMethods;
//# sourceMappingURL=databaseMethods.js.map