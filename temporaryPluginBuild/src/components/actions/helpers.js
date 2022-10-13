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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapOutAliasedAction = exports.evaluateParameters = void 0;
const lodash_1 = require("lodash");
const expression_evaluator_1 = __importDefault(require("@openmsupply/expression-evaluator"));
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
function evaluateParameters(parameterQueries, evaluatorParameters = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const parametersEvaluated = {};
        try {
            for (const key in parameterQueries) {
                parametersEvaluated[key] = yield expression_evaluator_1.default(parameterQueries[key], evaluatorParameters);
            }
            return parametersEvaluated;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.evaluateParameters = evaluateParameters;
exports.swapOutAliasedAction = (templateId, action) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch aliased action from database
    const { condition } = action, _a = action.parameter_queries, { code, shouldOverrideCondition } = _a, overrideParams = __rest(_a, ["code", "shouldOverrideCondition"]);
    if (!code)
        throw new Error('Missing code in aliased action');
    const aliasedAction = yield databaseConnect_1.default.getSingleTemplateAction(templateId, code);
    if (!aliasedAction)
        throw new Error('No Action matching alias');
    // Override condition if specified
    // The alias condition (if specified) will take priority over the original
    // action condition. However, the default condition is "true", and we don't
    // want that to ALWAYS override the original action condition. So we ignore it
    // if the alias condition = true. In the event that we actually *want* this to
    // override, the "shouldOverrideCondition" parameter should be set to "true"
    if (condition !== true || shouldOverrideCondition)
        aliasedAction.condition = condition;
    // Override parameters
    aliasedAction.parameter_queries = lodash_1.merge(aliasedAction.parameter_queries, 
    // All docs generated through here should be preview docs/non-output
    { toBeDeleted: true, isOutputDoc: false }, overrideParams);
    return aliasedAction;
});
//# sourceMappingURL=helpers.js.map