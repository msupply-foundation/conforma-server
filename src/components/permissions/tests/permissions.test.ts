import { compileJWT, generateRowLevelPolicies } from '../rowLevelPolicyHelpers'
import { compileJWTdata, generateRowLevelPoliciesData } from './testdata'

// Test JWT generation
compileJWTdata.forEach(({ userInfo, templatePermissionRows, result }: any, index) => {
  test(`Test JWT generation: ${index + 1}`, () => {
    return expect(compileJWT(userInfo, templatePermissionRows)).toEqual(result)
  })
})

// Test Policies generation
generateRowLevelPoliciesData.forEach(({ permissionRows, result }: any, index) => {
  test(`Test Row Level Policies Generation: ${index + 1}`, () => {
    return expect(generateRowLevelPolicies(permissionRows)).toEqual(result)
  })
})
