import { filterApplicantClaims } from './applicantClaims'

describe('filterApplicantClaims', () => {
  const auth = {
    userId: 440,
    username: 'kshetty',
    orgId: 1,
    sessionId: 'abc',
    isAdmin: false,
    isManager: true,
    aud: 'postgraphile',
    iat: 1,
    exp: 2,
    pp2: 't',
    pp2_template_ids: '199,315',
    pp7: 't',
    pp7_template_ids: '9,57',
    pp9: 't',
    pp9_template_ids: '261',
    pp12: 't',
  }

  test('keeps the user claims and APPLY policy claims only', () => {
    expect(filterApplicantClaims(auth, [1, 2, 3, 8])).toEqual({
      userId: 440,
      username: 'kshetty',
      orgId: 1,
      sessionId: 'abc',
      pp2: 't',
      pp2_template_ids: '199,315',
    })
  })

  test('matches policy ids exactly, not by prefix', () => {
    // pp12 must not survive because policy 1 or 2 is an APPLY policy
    expect(filterApplicantClaims(auth, [1, 2])).not.toHaveProperty('pp12')
  })
})
