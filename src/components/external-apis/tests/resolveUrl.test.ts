import { resolveApiUrl } from '../resolveUrl'

/*
`new URL(url, base)` follows RFC 3986 relative resolution, which silently eats
a path segment when the base has no trailing slash, and discards the base path
when the url has a leading one. Both are natural things to write in config.
*/
describe('resolveApiUrl', () => {
  const EXPECTED = 'http://localhost:2048/api/v4/login'

  it.each([
    ['http://localhost:2048/api/v4/', 'login'],
    ['http://localhost:2048/api/v4', 'login'],
    ['http://localhost:2048/api/v4/', '/login'],
    ['http://localhost:2048/api/v4', '/login'],
  ])('resolves %s + %s to the same url', (baseUrl, url) => {
    expect(resolveApiUrl(baseUrl, url)).toBe(EXPECTED)
  })

  it('appends a nested path without losing any of the base', () => {
    expect(resolveApiUrl('https://api.example.org/v2', 'person/name')).toBe(
      'https://api.example.org/v2/person/name'
    )
  })

  it('is unchanged for a root-path base, as the documented examples use', () => {
    expect(resolveApiUrl('https://private-medical-data.org', 'drugs')).toBe(
      'https://private-medical-data.org/drugs'
    )
  })

  // "//login" would otherwise be protocol-relative, with "login" as the host
  it('strips every leading slash, not only one', () => {
    expect(resolveApiUrl('http://localhost:2048/api/v4/', '//login')).toBe(EXPECTED)
  })

  it('lets an absolute url win outright', () => {
    expect(resolveApiUrl('http://localhost:2048/api/v4/', 'https://elsewhere.org/x')).toBe(
      'https://elsewhere.org/x'
    )
  })
})
