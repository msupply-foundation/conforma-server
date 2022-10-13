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
exports.generateRowLevelPolicies = exports.updateRowPolicies = exports.compileJWT = exports.compileRowLevelPolicies = exports.baseJWT = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const helpersUtilities_1 = require("./helpersUtilities");
const helpersConstants_1 = require("./helpersConstants");
exports.baseJWT = { aud: 'postgraphile' };
/* Compiles JWT from userInfo and PerissionRows
  in { userId: 1, ... }, [
  {
    templatePermissionRestrictions: {
      restrictOne: 1,
      restrictTwo: 2,
    },
    templateId: 1,
    permissionPolicyId: 2,
    permissionNameId: 3,
    templatePermissionId: 4,
  }]
  out {
    aud: 'postgraphile',
    userId: 1,
    orgId: 2, (if supplied)
    pp2pn3: true,
    pp2pn3tp4: true,
    pp2pn3tp4_templateId: "1",
    pp2pn3tp4_restrictOne: "1",
    pp2pn3tp4_restrictTwo: "2"
  }
*/
const compileJWT = (JWTelements) => {
    const { userId, orgId, templatePermissionRows, sessionId, isAdmin } = JWTelements;
    let JWT = Object.assign(Object.assign({}, exports.baseJWT), { userId, orgId, sessionId, isAdmin });
    const templateIdsForPolicy = {};
    templatePermissionRows.forEach((permissionRow) => {
        const { templateId, permissionPolicyId } = permissionRow;
        const permissionPolicyAbbreviation = `pp${permissionPolicyId}`;
        const templateIdsKey = `${permissionPolicyAbbreviation}_template_ids`;
        if (!templateIdsForPolicy[templateIdsKey])
            templateIdsForPolicy[templateIdsKey] = [];
        if (!templateIdsForPolicy[templateIdsKey].includes(templateId || 0))
            templateIdsForPolicy[templateIdsKey].push(templateId || 0);
        JWT = Object.assign(Object.assign({}, JWT), { [permissionPolicyAbbreviation]: 't', [templateIdsKey]: templateIdsForPolicy[templateIdsKey].join(',') });
    });
    return JWT;
};
exports.compileJWT = compileJWT;
// Removes previously generated row level policies and reinstates them based on current permission settings
// out: [ 'CREATE POLICY "view_pp3pn3" ON "application" FOR SELECT USING (jwt_get_boolean('pp3pn3') = true and user_id = jwt_get_text('currentUser') AND template_id = jwt_get_bigint('pp3pn3_templateId')' ]
const updateRowPolicies = () => __awaiter(void 0, void 0, void 0, function* () {
    const permissionRows = yield databaseConnect_1.default.getPermissionPolicies();
    // this will get all of the policies from pg_policies table that start with (view_ or update_ or delete_ or create_)
    const existingPolicies = yield databaseConnect_1.default.getAllGeneratedRowPolicies();
    // returns an array of 'CREATE POLICY' strings
    const newPolicies = generateRowLevelPolicies(permissionRows);
    // Deleting existing policies
    yield databaseConnect_1.default.query({
        text: existingPolicies
            .map(({ policyname, tablename }) => `DROP POLICY "${policyname}" ON "${tablename}"`)
            .join(';'),
    });
    console.log(newPolicies.join(';'));
    // Reinstate policies
    yield databaseConnect_1.default.query({
        text: newPolicies.join(';'),
    });
    // Temporarily hard-code create/update permissions RLS-enabled tables
    yield databaseConnect_1.default.query({
        text: `
    CREATE POLICY "create_all_application" ON application FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_application" ON application FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "delete_all_application" ON application FOR DELETE USING(true);
    CREATE POLICY "create_all_application_response" ON application_response FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_application_response" ON application_response FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "delete_all_application_response" ON application_response FOR DELETE USING(true);
    CREATE POLICY "create_all_review" ON review FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_review" ON review FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "delete_all_revew" ON review FOR DELETE USING(true);
    CREATE POLICY "create_all_review_assignment" ON review_assignment FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_review_assignment" ON review_assignment FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "delete_all_review_assignment" ON review_assignment FOR DELETE USING(true);
    `,
    });
    return newPolicies;
});
exports.updateRowPolicies = updateRowPolicies;
const generateRowLevelPolicies = (permissionRows) => {
    let policiesObject = {};
    permissionRows.forEach((permissionRow) => {
        const { id, rules } = permissionRow;
        if (!rules)
            return;
        const permissionPolicyAbbreviation = `pp${id}`;
        policiesObject = Object.assign(Object.assign({}, policiesObject), { [permissionPolicyAbbreviation]: exports.compileRowLevelPolicies(permissionPolicyAbbreviation, rules) });
    });
    // Turn from object (of keys and arrays) to flattened array
    const policies = Object.values(policiesObject).flat();
    return policies;
};
exports.generateRowLevelPolicies = generateRowLevelPolicies;
exports.compileRowLevelPolicies = (permissionAbbreviation, permissionPolicyRules) => {
    const policies = [];
    Object.entries(permissionPolicyRules).forEach(([tableName, rulesByType]) => {
        let usingCondition = 'true';
        const { view: viewRules } = rulesByType;
        // Need to figure out USING clause for UPDATE rule that defines WITH CHECK via rules (for UPDATE, see compileRowLevelPolicy for more details)
        // So the UPDATE policy will use USING clause from view (select) rules
        if (viewRules)
            usingCondition = replacePlaceholders(helpersUtilities_1.getSqlConditionFromJSON(viewRules), permissionAbbreviation);
        Object.entries(rulesByType).forEach(([ruleType, rules]) => {
            // replacePlaceholders would replace `jwtUserDetails_bigint_${something}` with `jwt_get_bigint_${something}` etc..
            const condition = replacePlaceholders(helpersUtilities_1.getSqlConditionFromJSON(rules), permissionAbbreviation);
            policies.push(compileRowLevelPolicy(tableName, permissionAbbreviation, ruleType, usingCondition, condition));
        });
    });
    return policies;
};
/* Compiles single row level permission
  in "application", "pp2pn2tp2", "view", "true",
      "user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')"
  out `CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId'))`
*/
const compileRowLevelPolicy = (tableName, permissionAbbreviation, ruleType, usingCondition, condition) => {
    // We want to first check if the permission exists in JWT token (to make sure we only do the full query if it exists),
    // so we add a check for "policy": true, i.e. jwt_get_boolean('pp2pn2tp2') = true
    // this will become first condition in both USING and WITH CHECK of every row level rule
    const addBracketsAndPermissionCheck = (condition) => `(COALESCE(current_setting('jwt.claims.${permissionAbbreviation}', true),'') != '' and ${condition})`;
    // If using clause is not used return nothing
    // otherwise return USING from usingCondition (view rule, see compileRowLevelPolicies) or condition (current rule condition)
    const getUsingClause = () => {
        if (!ruleSettings.using)
            return '';
        const conditionToUse = ruleSettings.withCheck ? usingCondition : condition;
        return `USING ${addBracketsAndPermissionCheck(conditionToUse)}`;
    };
    const ruleSettings = helpersConstants_1.compileRowLevelPolicyRuleTypes[ruleType]; // { for: 'CREATE'|'DELETE'|'UPDATE'|'SELECT', using: true|false, withCheck: true|false }
    if (!ruleSettings) {
        console.warn(`rule ${ruleType} does not exist, ignoring`);
        return '';
    }
    const create = `CREATE POLICY "${ruleType}_${permissionAbbreviation}"`;
    const onFor = `ON "${tableName}" FOR ${ruleSettings.for}`;
    const withCheck = ruleSettings.withCheck
        ? `WITH CHECK ${addBracketsAndPermissionCheck(condition)}`
        : '';
    // Combine them all
    return `${create} ${onFor} ${getUsingClause()} ${withCheck}`;
};
// Replaces 'placeholder' templated values in a string
// in `hello there, in jwt there is this user id: jwtUserDetails_bigint_userId, and this is permission specific template_id: jwtPermission_bigint_templateId`, `somePermissionAbbreviation`
// out `hello there, in jwt there is this user id: jwt_get_bigint('userId'), and this is permission specific template_id: jwt_get_bigint('somePermissionAbbreviation_tempalteId')`
const replacePlaceholders = (sql, permissionAbbreviation) => {
    let resultSql = sql;
    const replacements = [
        {
            prefix: 'jwtUserDetails_bigint_',
            prefixReplacement: `COALESCE(nullif(current_setting('jwt.claims.`,
            postfix: `', true),''),'0')::integer`,
        },
        {
            prefix: 'jwtUserDetails_text_',
            prefixReplacement: `COALESCE(current_setting('jwt.claims.`,
            postfix: `', true),'')`,
        },
        {
            prefix: 'jwtPermission_bigint_',
            prefixReplacement: `COALESCE(nullif(current_setting('jwt.claims.${permissionAbbreviation}_`,
            postfix: `', true),''),'0')::integer`,
        },
        {
            prefix: 'jwtPermission_array_bigint_',
            prefixReplacement: `any (string_to_array(COALESCE(current_setting('jwt.claims.${permissionAbbreviation}_`,
            postfix: `', true), '0'), ',')::integer[])`,
        },
    ];
    replacements.forEach(({ prefix, prefixReplacement, postfix }) => {
        let match;
        const regex = new RegExp(`${prefix}\\w*`, 'g');
        while ((match = regex.exec(resultSql))) {
            const matchedValue = match[0];
            const newValue = `${matchedValue.replace(prefix, prefixReplacement)}${postfix}`;
            resultSql = resultSql.replace(matchedValue, newValue);
        }
    });
    return resultSql;
};
//# sourceMappingURL=rowLevelPolicyHelpers.js.map