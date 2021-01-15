import { RuleTypes } from './types'

// Constants for compileRowLevelPolicy
// https://www.postgresql.org/docs/current/sql-createpolicy.html
const compileRowLevelPolicyRuleTypes: RuleTypes = {
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
}

export { compileRowLevelPolicyRuleTypes }
