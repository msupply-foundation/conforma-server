/*
The JWT secret is resolved once, when config.ts is first imported, and either
the process holds a real one or it must not start at all. Every case therefore
needs its own fresh import under its own environment.

dotenv is stubbed because the repo's own .env supplies JWT_SECRET, which would
mask the cases where it is meant to be absent.

jest.doMock + require rather than the usual hoisted jest.mock: ts-jest 26 hoists
via ts.getMutableClone, which TypeScript 5 removed, so jest.mock does not
compile. doMock is not hoisted, so the requires must come after it.
*/
jest.doMock('dotenv', () => ({ config: () => ({ parsed: {} }) }))

const DEV_SECRET = 'devsecret'

const importConfigWith = (env: Record<string, string | undefined>) => {
  const original = process.env
  process.env = { ...original, ...env }
  for (const [key, value] of Object.entries(env)) if (value === undefined) delete process.env[key]

  try {
    let jwtSecret = ''
    jest.isolateModules(() => {
      jwtSecret = require('./config').default.jwtSecret
    })
    return jwtSecret
  } finally {
    process.env = original
  }
}

describe('JWT secret resolution', () => {
  let warn: jest.SpyInstance
  let error: jest.SpyInstance

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    error = jest.spyOn(console, 'error').mockImplementation(() => {})
    // config.ts logs on import; keep the suite output readable
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('uses JWT_SECRET when one is provided', () => {
    expect(importConfigWith({ JWT_SECRET: 'a-real-secret' })).toBe('a-real-secret')
    expect(warn).not.toHaveBeenCalled()
  })

  it('trims the provided value', () => {
    expect(importConfigWith({ JWT_SECRET: '  a-real-secret  ' })).toBe('a-real-secret')
  })

  // A production build is the one launch that must never run on the public
  // fallback, so it stops rather than starting insecurely.
  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['whitespace only', '   '],
  ])('exits a production build when JWT_SECRET is %s', (_case, value) => {
    const exit = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
      throw new Error(`exit:${code}`)
    })

    expect(() => importConfigWith({ NODE_ENV: 'production', JWT_SECRET: value })).toThrow('exit:1')
    expect(exit).toHaveBeenCalledWith(1)
    expect(error).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET'))
  })

  // Development keeps a stable, shared secret so fixtures and a reload do not
  // invalidate every token, but has to say so out loud.
  it.each([
    ['unset', undefined],
    ['empty', ''],
    ['whitespace only', '   '],
  ])('falls back to the development secret when JWT_SECRET is %s', (_case, value) => {
    expect(importConfigWith({ NODE_ENV: 'development', JWT_SECRET: value })).toBe(DEV_SECRET)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('JWT_SECRET is not set'))
  })

  // The suite signs its own fixtures with the fallback, so warning on every
  // isolated import would be pure noise.
  it('stays quiet about the fallback during a test run', () => {
    expect(importConfigWith({ NODE_ENV: 'test', JWT_SECRET: undefined })).toBe(DEV_SECRET)
    expect(warn).not.toHaveBeenCalled()
  })
})
