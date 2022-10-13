"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSqlConditionFromJSON = exports.remapObjectKeysWithPrefix = exports.getTemplatePermissionAbbreviation = exports.getPermissionNameAbbreviation = void 0;
// Need to use require as there are no types for json-sql-builder2, can attempt to add them in the future
const SQLBuilder = require('json-sql-builder2');
const jsonToSql = new SQLBuilder('PostgreSQL');
// in { permissionPolicyId: 1, permissionNameId:2 }
// out "pp1pn2"
const getPermissionNameAbbreviation = ({ permissionPolicyId, permissionNameId }) => `pp${permissionPolicyId}pn${permissionNameId}`;
exports.getPermissionNameAbbreviation = getPermissionNameAbbreviation;
// in { permissionPolicyId: 1, permissionNameId:2, templatePermissionId: 3 }
// out "pp1pn2tp3"
const getTemplatePermissionAbbreviation = (permissionRow) => `${getPermissionNameAbbreviation(permissionRow)}tp${permissionRow.templatePermissionId}`;
exports.getTemplatePermissionAbbreviation = getTemplatePermissionAbbreviation;
// Returns new version of object with each key prefixed with prefix (and value converter to string)
// in "prefixMe", { one: 1, two: 2}
// out { prefixMe_one: "1", prefixMe_two: "2" }
const remapObjectKeysWithPrefix = (prefix, object) => {
    const remappedObject = {};
    Object.entries(object).forEach(([key, value]) => {
        remappedObject[`${prefix}_${key}`] = String(value);
    });
    return remappedObject;
};
exports.remapObjectKeysWithPrefix = remapObjectKeysWithPrefix;
// Creates SQL from JSON, as per https://github.com/planetarydev/json-sql-builder2, but only for WHERE clause content
// in { job_title: { $in: ['Sales Manager', 'Account Manager'] }, country_code: 'RU' }
// out `job_title IN ('Sales Manager', 'Account Manager') AND country_code = 'RU'`
const getSqlConditionFromJSON = (jsonSQLcondition) => {
    // with no select field specified will default to SELECT *
    const { sql, values } = jsonToSql.$select({
        $where: Object.assign({}, jsonSQLcondition),
    });
    let query = sql;
    // $select return key values, which need to be replaced
    // count backwards in case ${x} above 9 exists
    for (let i = values.length - 1; i >= 0; i--) {
        query = query.replace(`$${i + 1}`, values[i]);
    }
    // Finally return only the WHERE part
    return query.replace('SELECT * WHERE ', '');
};
exports.getSqlConditionFromJSON = getSqlConditionFromJSON;
//# sourceMappingURL=helpersUtilities.js.map