import databaseConnect from '../databaseConnect'
import { PermissionRow } from './types'
import { getSqlConditionFromJSON } from './helpersUtilities'

import { compileRowLevelPolicyRuleTypes } from './helpersConstants'
import { permissionPolicyColumns } from '../postgresConnect'

export const baseJWT = { aud: 'postgraphile' }

/* Compiles JWT from userInfo and PermissionRows
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
  const { userId, orgId, username, templatePermissionRows, sessionId, isAdmin, isManager } =
    JWTelements

  let JWT: any = { ...baseJWT, userId, orgId, username, sessionId, isAdmin, isManager }
  const templateIdsForPolicy: { [policyAbbreviation: string]: number[] } = {}

  templatePermissionRows.forEach((permissionRow: PermissionRow) => {
    const { templateId, permissionPolicyId } = permissionRow

    const permissionPolicyAbbreviation = `pp${permissionPolicyId}`

    const templateIdsKey = `${permissionPolicyAbbreviation}_template_ids`
    if (!templateIdsForPolicy[templateIdsKey]) templateIdsForPolicy[templateIdsKey] = []
    if (!templateIdsForPolicy[templateIdsKey].includes(templateId || 0))
      templateIdsForPolicy[templateIdsKey].push(templateId || 0)

    JWT = {
      ...JWT,
      [permissionPolicyAbbreviation]: 't',
      [templateIdsKey]: templateIdsForPolicy[templateIdsKey].join(','),
    }
  })
  return JWT
}

// Removes previously generated row level policies and reinstates them based on current permission settings
// out: [ 'CREATE POLICY "view_pp3pn3" ON "application" FOR SELECT USING (jwt_get_boolean('pp3pn3') = true and user_id = jwt_get_text('currentUser') AND template_id = jwt_get_bigint('pp3pn3_templateId')' ]
const updateRowPolicies = async () => {
  console.log('Updating row level policies...')
  const permissionRows = await databaseConnect.getPermissionPolicies()
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
  // console.log(newPolicies.join(';'))
  // Reinstate policies
  await databaseConnect.query({
    text: newPolicies.join(';'),
  })

  // Temporarily hard-code create/update permissions RLS-enabled tables
  await databaseConnect.query({
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
  })

  return newPolicies
}

const generateRowLevelPolicies = (permissionRows: permissionPolicyColumns[]) => {
  let policiesObject: { [index: string]: Array<string> } = {}

  permissionRows.forEach((permissionRow: permissionPolicyColumns) => {
    const { id, rules } = permissionRow
    if (!rules) return

    const permissionPolicyAbbreviation = `pp${id}`
    policiesObject = {
      ...policiesObject,
      [permissionPolicyAbbreviation]: compileRowLevelPolicies(permissionPolicyAbbreviation, rules),
    }
  })
  // Turn from object (of keys and arrays) to flattened array
  const policies = Object.values(policiesObject).flat()

  return policies
}

export const compileRowLevelPolicies = (
  permissionAbbreviation: string,
  permissionPolicyRules: object
) => {
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
  out `
  CREATE OR REPLACE FUNCTION private.policy_pp2pn2tp2_check_application ()
      RETURNS SETOF application
      SECURITY DEFINER
      AS $$
        SELECT * FROM application WHERE user_id = jwt_get_bigint('userId') AND template_id = jwt_get_bigint('pp2pn2tp2_templateId')
  $$
  LANGUAGE sql
  STABLE;
  CREATE POLICY "view_pp2pn2tp2" ON "application" FOR SELECT USING (jwt_get_boolean('pp2pn2tp2') = true and ID in (SELECT ID from private.policy_pp2pn2tp2_check_application ())`
*/
const compileRowLevelPolicy = (
  tableName: string,
  permissionAbbreviation: string,
  ruleType: string,
  usingCondition: string,
  condition: string
) => {
  // Create function for permission so that row level policies are checked independently
  // SECURITY DEFINER is used to make sure permission check does not take into account existing permissions
  // i.e. without this function, if we have something like this "restrict review by review_assignment where user is reviewer"
  // and then we have another restriction of "review_assignment where user is assigner" in the former policy check the latter check will also run
  const functionName = `private.policy_check_${permissionAbbreviation}_${tableName}`
  const permissionFunction = `
    CREATE OR REPLACE FUNCTION ${functionName} ()
      RETURNS SETOF ${tableName}
      SECURITY DEFINER
      AS $$
        SELECT * FROM ${tableName} WHERE ${usingCondition}
  $$
  LANGUAGE sql
  STABLE;
  `

  // We want to first check if the permission exists in JWT token (to make sure we only do the full query if it exists),
  // so we add a check for "policy": true, i.e. jwt_get_boolean('pp2pn2tp2') = true
  // this will become first condition in both USING and WITH CHECK of every row level rule
  const addBracketsAndPermissionCheck = (condition: string) =>
    `(COALESCE(current_setting('jwt.claims.${permissionAbbreviation}', true),'') != '' AND ${condition})`

  // If USING clause is not used return nothing
  // otherwise return USING from usingCondition (which comes from the defined 'view' rule))
  const getUsingClause = () => {
    if (!ruleSettings.using) return ''
    return `USING ${addBracketsAndPermissionCheck(`id IN (SELECT id FROM ${functionName}())`)}`
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
  return `${permissionFunction} ${create} ${onFor} ${getUsingClause()} ${withCheck}`
}

// Replaces 'placeholder' templated values in a string
// in `hello there, in jwt there is this user id: jwtUserDetails_bigint_userId, and this is permission specific template_id: jwtPermission_bigint_templateId`, `somePermissionAbbreviation`
// out `hello there, in jwt there is this user id: jwt_get_bigint('userId'), and this is permission specific template_id: jwt_get_bigint('somePermissionAbbreviation_tempalteId')`
const replacePlaceholders = (sql: string, permissionAbbreviation: string) => {
  let resultSql = sql

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
