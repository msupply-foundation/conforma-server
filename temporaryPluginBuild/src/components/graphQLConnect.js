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
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("../config"));
const loginHelpers_1 = require("./permissions/loginHelpers");
const endpoint = config_1.default.graphQLendpoint;
class GraphQLdb {
    constructor() {
        this.adminJWT = '';
        this.gqlQuery = (query, variables = {}, authHeader = '') => __awaiter(this, void 0, void 0, function* () {
            if (this.adminJWT === '')
                this.adminJWT = yield loginHelpers_1.getAdminJWT();
            const queryResult = yield node_fetch_1.default(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: authHeader === '' ? `Bearer ${this.adminJWT}` : authHeader,
                },
                body: JSON.stringify({
                    query: query,
                    variables: variables,
                }),
            });
            const data = yield queryResult.json();
            if (data.errors)
                throw new Error(`problem executing gql: ${query} variables: ${variables} errors: ${JSON.stringify(data.errors, null, ' ')}`);
            return data.data;
        });
        this.getReviewData = (reviewId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.gqlQuery(`
      query getReviewData($id: Int!) {
        review(id: $id) {
          levelNumber
          isLastLevel
          isLastStage
          status
          reviewer {
            id
            username
            firstName
            lastName
            email
          }
          latestDecision {
              decision
              comment
          }
          reviewAssignment {
            isLocked
          }
        }
      }
      `, { id: reviewId });
            return data.review;
        });
        this.getReviewDataFromAssignment = (reviewAssignmentId) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.gqlQuery(`
      query getReview($reviewAssignmentId: Int!) {
        reviews(filter: { reviewAssignmentId: { equalTo: $reviewAssignmentId } }) {
          nodes {
            reviewId: id
            levelNumber
            isLastLevel
            isLastStage
            status
            reviewer {
              id
              username
              firstName
              lastName
              email
            }
            latestDecision {
                decision
                comment
            }
            reviewAssignment {
              isLocked
            }
          }
        }
      }
      `, { reviewAssignmentId });
            return ((_a = data === null || data === void 0 ? void 0 : data.reviews) === null || _a === void 0 ? void 0 : _a.nodes[0]) || null;
        });
        this.isInternalOrg = (orgId) => __awaiter(this, void 0, void 0, function* () {
            var _b, _c;
            const data = yield this.gqlQuery(`
      query getOrganisation($orgId: Int!) {
        organisation(id: $orgId) {
          isSystemOrg
        }
      }
      `, { orgId });
            return (_c = (_b = data === null || data === void 0 ? void 0 : data.organisation) === null || _b === void 0 ? void 0 : _b.isSystemOrg) !== null && _c !== void 0 ? _c : false;
        });
        this.getTemplateId = (tableName, record_id) => __awaiter(this, void 0, void 0, function* () {
            switch (tableName) {
                default:
                    throw new Error('Method not yet implemented for this table');
            }
            // Not implemented yet -- needs more data in DB
        });
        this.getAllApplicationTriggers = (serial) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.gqlQuery(`
      query getTriggers($serial: String!) {
        applicationBySerial(serial: $serial) {
          reviewAssignments {
            nodes {
              id
              trigger
            }
          }
          reviews {
            nodes {
              id
              trigger
            }
          }
          verifications {
            nodes {
              id
              trigger
            }
          }
          applicationId: id
          applicationTrigger: trigger
        }
      }
      `, { serial });
            return (data === null || data === void 0 ? void 0 : data.applicationBySerial) || null;
        });
        this.getTemplatePermissionsFromApplication = (applicationId) => __awaiter(this, void 0, void 0, function* () {
            const data = yield this.gqlQuery(`
      query getTemplatePermissions($applicationId: Int!) {
        application(id: $applicationId) {
          template {
            templatePermissions {
              nodes {
                permissionName {
                  name
                  isSystemOrgPermission
                  permissionPolicy {
                    name
                    type
                  }
                }
              }
            }
          }
        }
      }
    `, { applicationId });
            return (data === null || data === void 0 ? void 0 : data.application.template.templatePermissions.nodes) || null;
        });
    }
    // constructor() {}
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
const graphqlDBInstance = GraphQLdb.Instance;
exports.default = graphqlDBInstance;
//# sourceMappingURL=graphQLConnect.js.map