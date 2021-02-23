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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var databaseMethods = function (DBConnect) { return ({
    getAllApplicationResponses: function (applicationId) { return __awaiter(void 0, void 0, void 0, function () {
        var text, result, responses, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "\n    SELECT ar.id, code, value, time_created\n    FROM application_response ar JOIN template_element te\n    ON ar.template_element_id = te.id\n    WHERE application_id = $1\n    ORDER BY time_created\n    ";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DBConnect.query({ text: text, values: [applicationId] })];
                case 2:
                    result = _a.sent();
                    responses = result.rows;
                    return [2 /*return*/, responses];
                case 3:
                    err_1 = _a.sent();
                    console.log(err_1.message);
                    throw err_1;
                case 4: return [2 /*return*/];
            }
        });
    }); },
    getAllReviewResponses: function (reviewId) { return __awaiter(void 0, void 0, void 0, function () {
        var text, result, responses, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "\n    SELECT rr.id, code, comment, decision, rr.time_created\n    FROM review_response rr JOIN application_response ar\n    ON rr.application_response_id = ar.id\n    JOIN template_element te ON ar.template_element_id = te.id\n    WHERE review_id = $1\n    ORDER BY time_created\n    ";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DBConnect.query({ text: text, values: [reviewId] })];
                case 2:
                    result = _a.sent();
                    responses = result.rows;
                    return [2 /*return*/, responses];
                case 3:
                    err_2 = _a.sent();
                    console.log(err_2.message);
                    throw err_2;
                case 4: return [2 /*return*/];
            }
        });
    }); },
    deleteApplicationResponses: function (responsesToDelete) { return __awaiter(void 0, void 0, void 0, function () {
        var text, result, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "DELETE from application_response\n      WHERE id = ANY ($1)\n      RETURNING (SELECT code FROM\n      template_element WHERE id = template_element_id)\n      ";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DBConnect.query({ text: text, values: [responsesToDelete] })];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.rows.map(function (row) { return row.code; })];
                case 3:
                    err_3 = _a.sent();
                    console.log(err_3.message);
                    throw err_3;
                case 4: return [2 /*return*/];
            }
        });
    }); },
    deleteReviewResponses: function (responsesToDelete) { return __awaiter(void 0, void 0, void 0, function () {
        var text, result, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    text = "DELETE from review_response\n      WHERE id = ANY ($1)\n      RETURNING (SELECT code FROM\n        application_response JOIN template_element\n        ON template_element_id = template_element.id\n        WHERE application_response.id = application_response_id)\n      ";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, DBConnect.query({ text: text, values: [responsesToDelete] })];
                case 2:
                    result = _a.sent();
                    return [2 /*return*/, result.rows.map(function (row) { return row.code; })];
                case 3:
                    err_4 = _a.sent();
                    console.log(err_4.message);
                    throw err_4;
                case 4: return [2 /*return*/];
            }
        });
    }); },
}); };
exports.default = databaseMethods;
