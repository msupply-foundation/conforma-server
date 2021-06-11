import databaseConnect from '../databaseConnect'
import { UserInfo, PermissionRow } from './types'
import {
  getPermissionNameAbbreviation,
  getTemplatePermissionAbbreviation,
  remapObjectKeysWithPrefix,
  getSqlConditionFromJSON,
} from './helpersUtilities'

import { compileRowLevelPolicyRuleTypes } from './helpersConstants'

export const baseJWT = { aud: 'postgraphile' }

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
const compileJWT = (JWTelements: any) => {
  const { userId, orgId, templatePermissionRows, sessionId } = JWTelements

  let JWT = { ...baseJWT, userId, orgId, sessionId }

  templatePermissionRows.forEach((permissionRow: PermissionRow) => {
    const { restrictions, templateId, templatePermissionId } = permissionRow

    const permissionAbbreviation = getPermissionNameAbbreviation(permissionRow)
    // Add just the basic permission_policy -> permission_name key
    JWT = {
      [permissionAbbreviation]: true,
      ...JWT,
    }
    // It's possible to have permission name given to user without any templatePermissionIds
    if (!templatePermissionId) return // 'continue' syntax for for each

    // Add permission_policy -> permission->name -> template_permission properties
    const templatePermissionAbbreviation = getTemplatePermissionAbbreviation(permissionRow)
    JWT = {
      [templatePermissionAbbreviation]: true,
      ...remapObjectKeysWithPrefix(templatePermissionAbbreviation, {
        ...restrictions,
        templateId,
      }),
      ...JWT,
    }
  })
  return JWT
}

// Removes previously generated row level policies and reinstates them based on current permission settings
// out: [ 'CREATE POLICY "view_pp3pn3" ON "application" FOR SELECT USING (jwt_get_boolean('pp3pn3') = true and user_id = jwt_get_text('currentUser') AND template_id = jwt_get_bigint('pp3pn3_templateId')' ]
const updateRowPolicies = async () => {
  const permissionRows = await databaseConnect.getAllPermissions()
  // this will get all of the policies from pg_policies table that start with (view_ or update_ or delete_ or create_)
  const existingPolicies = await databaseConnect.getAllGeneratedRowPolicies()
  // returns an array of 'CREATE POLICY' strings
  const newPolicies = generateRowLevelPolicies(permissionRows)

  // Deleting existing policies

  await databaseConnect.query({
    text: existingPolicies
      .map(({ policyname, tablename }: any) => `DROP POLICY "${policyname}" ON "${tablename}"`)
      .join(';'),
  })

  // Reinstate policies

  await databaseConnect.query({
    text: newPolicies.join(';'),
  })

  // Temporarily hard-code create/update permissions RLS-enabled tables
  await databaseConnect.query({
    text: `
    CREATE POLICY "create_all_application" ON application FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_application" ON application FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "create_all_application_response" ON application_response FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_application_response" ON application_response FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "create_all_review" ON review FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_review" ON review FOR UPDATE USING(true) WITH CHECK (true);
    CREATE POLICY "create_all_review_assignment" ON review_assignment FOR INSERT WITH CHECK (true);
    CREATE POLICY "update_all_review_assignment" ON review_assignment FOR UPDATE USING(true) WITH CHECK (true);
    `,
  })

  return newPolicies
}

/* Generates row level policies based on PermissionRows
  in [
  {
    permissionPolicyId: 2,
    permissionNameId: 2,
    templatePermissionId: 2,
    permissionPolicyRules: {
      application: {
        view: {
          template_id: 'jwtPermission_bigint_templateId',
          user_id: 'jwtUserDetails_bigint_userId',
        },
      },
    },
  }]

  out [
    `CREATE POLICY "view_pp2pn2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2_templateId'))`,
    `CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId'))`
  ]
*/
const generateRowLevelPolicies = (permissionRows: Array<PermissionRow>) => {
  let policiesObject: { [index: string]: Array<string> } = {}

  permissionRows.forEach((permissionRow: PermissionRow) => {
    const { permissionPolicyRules, templatePermissionId } = permissionRow
    if (!permissionPolicyRules) return

    const permissionNameAbbreviation = getPermissionNameAbbreviation(permissionRow)
    policiesObject = {
      ...policiesObject,
      [permissionNameAbbreviation]: compileRowLevelPolicies(
        permissionNameAbbreviation,
        permissionPolicyRules
      ),
    }
    // It's possible to have permission policy linked to permission name without any templatePermissionIds
    if (!templatePermissionId) return

    const templatePermissionAbbreviation = getTemplatePermissionAbbreviation(permissionRow)
    policiesObject = {
      ...policiesObject,
      [templatePermissionAbbreviation]: compileRowLevelPolicies(
        templatePermissionAbbreviation,
        permissionPolicyRules
      ),
    }
  })
  // Turn from object (of keys and arrays) to flattened array
  const policies = Object.values(policiesObject).flat()

  return policies
}

/* Generates row level policies, for one set of rules (for one PermissionRow)
  in "pp2pn2tp2", {
      application: {
        view: {
          template_id: 'jwtPermission_bigint_templateId',
          user_id: 'jwtUserDetails_bigint_userId',
        },
      },
    }
  out [
    CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId'))
  ]
*/
const compileRowLevelPolicies = (permissionAbbreviation: string, permissionPolicyRules: object) => {
  const policies: Array<string> = []

  Object.entries(permissionPolicyRules).forEach(([tableName, rulesByType]) => {
    let usingCondition = 'true'
    const { view: viewRules } = rulesByType
    // Need to figure out USING clause for UPDATE rule that defines WITH CHECK via rules (for UPDATE, see compileRowLevelPolicy for more details)
    // So the UPDATE policy will use USING clause from view (select) rules
    if (viewRules)
      usingCondition = replacePlaceholders(
        getSqlConditionFromJSON(viewRules),
        permissionAbbreviation
      )

    Object.entries(rulesByType).forEach(([ruleType, rules]) => {
      // replacePlaceholders would replace `jwtUserDetails_bigint_${something}` with `jwt_get_bigint_${something}` etc..
      const condition = replacePlaceholders(getSqlConditionFromJSON(rules), permissionAbbreviation)

      policies.push(
        compileRowLevelPolicy(
          tableName,
          permissionAbbreviation,
          ruleType,
          usingCondition,
          condition
        )
      )
    })
  })

  return policies
}

/* Compiles single row level permission
  in "application", "pp2pn2tp2", "view", "true", 
      "user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')" 
  out `CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId'))`
*/
const compileRowLevelPolicy = (
  tableName: string,
  permissionAbbreviation: string,
  ruleType: string,
  usingCondition: string,
  condition: string
) => {
  // We want to first check if the permission exists in JWT token (to make sure we only do the full query if it exists),
  // so we add a check for "policy": true, i.e. jwt_get_boolean('pp2pn2tp2') = true
  // this will become first condition in both USING and WITH CHECK of every row level rule
  const addBracketsAndPermissionCheck = (condition: string) =>
    `(jwt_get_boolean('${permissionAbbreviation}') = true and ${condition})`

  // If using clause is not used return nothing
  // otherwise return USING from usingCondition (view rule, see compileRowLevelPolicies) or condition (current rule condition)
  const getUsingClause = () => {
    if (!ruleSettings.using) return ''
    const conditionToUse = ruleSettings.withCheck ? usingCondition : condition
    return `USING ${addBracketsAndPermissionCheck(conditionToUse)}`
  }

  const ruleSettings = compileRowLevelPolicyRuleTypes[ruleType] // { for: 'CREATE'|'DELETE'|'UPDATE'|'SELECT', using: true|false, withCheck: true|false }

  if (!ruleSettings) {
    console.warn(`rule ${ruleType} does not exist, ignoring`)
    return ''
  }

  const create = `CREATE POLICY "${ruleType}_${permissionAbbreviation}"`
  const onFor = `ON "${tableName}" FOR ${ruleSettings.for}`

  const withCheck = ruleSettings.withCheck
    ? `WITH CHECK ${addBracketsAndPermissionCheck(condition)}`
    : ''

  // Combine them all
  return `${create} ${onFor} ${getUsingClause()} ${withCheck}`
}

// Replaces 'placeholder' templated values in a string
// in `hello there, in jwt there is this user id: jwtUserDetails_bigint_userId, and this is permission specific template_id: jwtPermission_bigint_templateId`, `somePermissionAbbreviation`
// out `hello there, in jwt there is this user id: jwt_get_bigint('userId'), and this is permission specific template_id: jwt_get_bigint('somePermissionAbbreviation_tempalteId')`
const replacePlaceholders = (sql: string, permissionAbbreviation: string) => {
  let resultSql = sql

  const replacements = [
    {
      prefix: 'jwtUserDetails_bigint_',
      prefixReplacement: "jwt_get_bigint('",
      postfix: "')",
    },
    {
      prefix: 'jwtUserDetails_text_',
      prefixReplacement: "jwt_get_text('",
      postfix: "')",
    },
    {
      prefix: 'jwtPermission_bigint_',
      prefixReplacement: `jwt_get_bigint('${permissionAbbreviation}_`,
      postfix: "')",
    },
  ]

  replacements.forEach(({ prefix, prefixReplacement, postfix }) => {
    let match
    const regex = new RegExp(`${prefix}\\w*`, 'g')
    while ((match = regex.exec(resultSql))) {
      const matchedValue = match[0]
      const newValue = `${matchedValue.replace(prefix, prefixReplacement)}${postfix}`
      resultSql = resultSql.replace(matchedValue, newValue)
    }
  })
  return resultSql
}

export { compileJWT, updateRowPolicies, generateRowLevelPolicies }
