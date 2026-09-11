import { ApiAuthentication, ExternalApiConfigs } from './types'
import { isEnvVariableReference } from '../utilityFunctions'

/*
preferences.json is editable through the admin UI and is carried along by
snapshots and template exports, so a credential written into it literally
travels further than its author expects. `env.<VAR>` indirection exists for
exactly this (getEnvVariableReplacement), and every secret-bearing field
accepts it.

A warning, not a refusal -- kdd/auth-token-lifecycle §7. Hard-coding a password
here is perfectly reasonable for development and testing.
*/

// CookieLogin's secret sits under a key of the config author's choosing inside
// `login.body`, next to things that are not secret at all: mSupply's takes
// `username` and `loginType` alongside `password`. So only keys that look like
// a credential are checked. Warning on every literal in the body would fire on
// correct config, and a warning that cries wolf trains people to ignore it.
// This errs toward silence: a secret under an unusual name goes unremarked.
const CREDENTIAL_KEY = /pass|secret|token|key|auth/i

/*
Which fields of each auth type hold a secret, each paired with its value.

The value comes out alongside the name rather than being looked up from it
afterwards. For CookieLogin the name is chosen by the config author, and a key
holding a "." or a "[" -- "api.password" -- would read back as a path into
something that is not there, so the very secret it names would go unremarked.
The name is for the message and nothing else.

"Basic.username" is absent deliberately: it takes env. substitution too, but a
username is not a secret.
*/
type SecretField = { name: string; value: unknown }

const SECRET_FIELDS: {
  [T in ApiAuthentication['type']]: (
    authentication: Extract<ApiAuthentication, { type: T }>
  ) => SecretField[]
} = {
  Basic: ({ password }) => [{ name: 'password', value: password }],
  Bearer: ({ token }) => [{ name: 'token', value: token }],
  CookieToken: ({ token }) => [{ name: 'token', value: token }],
  CookieLogin: ({ login }) =>
    Object.entries(login?.body ?? {})
      .filter(([key]) => CREDENTIAL_KEY.test(key))
      .map(([key, value]) => ({ name: `login.body.${key}`, value })),
}

const secretFieldsOf = (authentication: ApiAuthentication): SecretField[] => {
  // Indexed by a runtime value that may be absent or unrecognised, which the
  // mapped type cannot express
  const fields = SECRET_FIELDS[authentication?.type] as
    ((authentication: ApiAuthentication) => SecretField[]) | undefined
  return fields?.(authentication) ?? []
}

export const warnAboutPlaintextSecrets = (apiConfigs: ExternalApiConfigs = {}) => {
  const literals = Object.entries(apiConfigs).flatMap(([name, { authentication }]) =>
    secretFieldsOf(authentication)
      // Absent is a different problem, and one the request itself will report
      .filter(({ value }) => value !== undefined && !isEnvVariableReference(value))
      .map((field) => `${name} ("${field.name}")`)
  )

  if (literals.length === 0) return

  console.log(`
!! WARNING ------------------------------------------------------------------
!! externalApiConfigs holds ${literals.length === 1 ? 'a secret' : 'secrets'} in plain text: ${literals.join(', ')}
!! preferences.json is editable through the admin UI and is included in
!! snapshots and template exports. Prefer "env.MY_VAR", which is replaced at
!! request time with the environment variable of that name.
!! ---------------------------------------------------------------------------`)
}
