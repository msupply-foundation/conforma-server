export type Claims = Record<string, string | number | boolean>

// Claims identifying the user, which APPLY policy rules read
const USER_CLAIMS = ['userId', 'username', 'orgId', 'sessionId']

// The caller's claims with only their APPLY policies (`pp<id>` and
// `pp<id>_template_ids`), so RLS finds an application only if the caller is
// its applicant, not one of its reviewers or viewers
export const filterApplicantClaims = (auth: Claims, applyPolicyIds: number[]): Claims =>
  Object.fromEntries(
    Object.entries(auth).filter(([key]) => {
      const policyClaim = key.match(/^pp(\d+)(_template_ids)?$/)
      return policyClaim
        ? applyPolicyIds.includes(Number(policyClaim[1]))
        : USER_CLAIMS.includes(key)
    })
  )
