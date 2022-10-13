"use strict";
// Test suite for the testResponses Action.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const databaseConnect_1 = __importDefault(require("../../../src/components/databaseConnect"));
const graphql_1 = require("../../../src/generated/graphql");
const index_1 = require("./index");
const DatabaseMethods = __importStar(require("./databaseMethods"));
let databaseMethodsDefault = jest.requireActual('./databaseMethods').default;
jest.spyOn(DatabaseMethods, 'default').mockImplementation((databaseConnect) => {
    return Object.assign(Object.assign({}, databaseMethodsDefault(databaseConnect)), { deleteApplicationResponses: (responsesToDelete) => __awaiter(void 0, void 0, void 0, function* () { return responsesToDelete.map((id) => ({ applicationResponseId: id, templateElementId: -1 })); }), updateApplicationResponseSubmittedTimestamps: (responsesToUpdate) => __awaiter(void 0, void 0, void 0, function* () { return responsesToUpdate.map((id) => ({ applicationResponseId: id, templateElementId: -1 })); }) });
});
test('trimResponses: trim application responses', () => __awaiter(void 0, void 0, void 0, function* () {
    let mock = jest.spyOn(databaseConnect_1.default, 'getAllApplicationResponses').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () {
        return [
            { id: 1, template_element_id: 1, value: null },
            {
                id: 2,
                template_element_id: 1,
                value: 'not null',
                is_reviewable: graphql_1.IsReviewableStatus.Always,
            },
            { id: 3, template_element_id: 2, value: null },
            { id: 4, template_element_id: 2, value: null, is_reviewable: graphql_1.IsReviewableStatus.Always },
            { id: 5, template_element_id: 3, value: null },
            { id: 6, template_element_id: 4, value: null, is_reviewable: graphql_1.IsReviewableStatus.Always },
        ];
    }));
    let result = yield index_1.action({
        parameters: { applicationId: 5 },
        DBConnect: databaseConnect_1.default,
    });
    expect(mock).toHaveBeenCalledWith(5);
    expect(result).toEqual({
        status: graphql_1.ActionQueueStatus.Success,
        error_log: '',
        output: {
            deletedResponses: [
                { applicationResponseId: 4, templateElementId: -1 },
                { applicationResponseId: 5, templateElementId: -1 },
            ],
            updatedResponses: [
                {
                    applicationResponseId: 2,
                    templateElementId: -1,
                },
                // Would be deleted before updated
                {
                    applicationResponseId: 4,
                    templateElementId: -1,
                },
                // Would be deleted before updated
                {
                    applicationResponseId: 5,
                    templateElementId: -1,
                },
                {
                    applicationResponseId: 6,
                    templateElementId: -1,
                },
            ],
        },
    });
}));
//# sourceMappingURL=trimResponsesWithoutDatabase.test.js.map