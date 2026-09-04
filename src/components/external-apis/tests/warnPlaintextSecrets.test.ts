import { warnAboutPlaintextSecrets } from '../warnPlaintextSecrets'
import { ExternalApiConfigs } from '../types'

const apiWith = (authentication: any): ExternalApiConfigs => ({
  MedServer: { baseUrl: 'https://example.org', authentication, routes: {} },
})

describe('warnAboutPlaintextSecrets', () => {
  let logged: string[]

  beforeEach(() => {
    logged = []
    jest.spyOn(console, 'log').mockImplementation((...args) => logged.push(args.join(' ')))
  })

  afterEach(() => jest.restoreAllMocks())

  const output = () => logged.join('\n')

  it('warns about a literal Basic password', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Basic', username: 'conforma', password: 'hunter2' }))

    expect(output()).toContain('MedServer ("password")')
  })

  it('warns about a literal Bearer token', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Bearer', token: 'abc123' }))

    expect(output()).toContain('MedServer ("token")')
  })

  it('warns about a literal ConformaSession token', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'ConformaSession', token: 'abc123' }))

    expect(output()).toContain('MedServer ("token")')
  })

  it('says nothing when the secret defers to an env variable', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'Basic', username: 'c', password: 'env.MED_PW' }))

    expect(output()).toBe('')
  })

  // A username is substitutable but not secret, so it isn't worth a warning
  it('ignores a literal Basic username', () => {
    warnAboutPlaintextSecrets(
      apiWith({ type: 'Basic', username: 'conforma', password: 'env.MED_PW' })
    )

    expect(output()).toBe('')
  })

  it('names every offending API', () => {
    warnAboutPlaintextSecrets({
      ...apiWith({ type: 'Bearer', token: 'abc' }),
      PeerConforma: {
        baseUrl: 'https://peer.example.org',
        authentication: { type: 'ConformaSession', token: 'xyz' },
        routes: {},
      },
    })

    expect(output()).toContain('MedServer ("token"), PeerConforma ("token")')
  })

  it('says nothing when no external APIs are configured', () => {
    warnAboutPlaintextSecrets(undefined)

    expect(output()).toBe('')
  })

  // Absent or malformed auth is a different problem, reported by the request
  it('says nothing about an unrecognised auth type', () => {
    warnAboutPlaintextSecrets(apiWith({ type: 'OAuth2', clientSecret: 'abc' }))
    warnAboutPlaintextSecrets(apiWith(undefined))

    expect(output()).toBe('')
  })
})
