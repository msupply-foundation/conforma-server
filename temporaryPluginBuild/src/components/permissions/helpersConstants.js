"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileRowLevelPolicyRuleTypes = void 0;
// Constants for compileRowLevelPolicy
// https://www.postgresql.org/docs/current/sql-createpolicy.html
const compileRowLevelPolicyRuleTypes = {
    view: {
        for: 'SELECT',
        using: true,
        withCheck: false,
    },
    update: {
        for: 'UPDATE',
        using: true,
        withCheck: true,
    },
    create: {
        for: 'CREATE',
        using: false,
        withCheck: true,
    },
    delete: {
        for: 'DELETE',
        using: true,
        withCheck: false,
    },
};
exports.compileRowLevelPolicyRuleTypes = compileRowLevelPolicyRuleTypes;
//# sourceMappingURL=helpersConstants.js.map