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

// Which field of each auth type holds a secret. "Basic.username" is absent
// deliberately: it takes env. substitution too, but a username is not a secret.
const SECRET_FIELD: { [type in ApiAuthentication['type']]: string } = {
  Basic: 'password',
  Bearer: 'token',
  CookieToken: 'token',
}

export const warnAboutPlaintextSecrets = (apiConfigs: ExternalApiConfigs = {}) => {
  const literals = Object.entries(apiConfigs).flatMap(([name, { authentication }]) => {
    const field = SECRET_FIELD[authentication?.type]
    if (!field) return []

    const value = (authentication as Record<string, unknown>)[field]
    // Absent is a different problem, and one the request itself will report
    if (value === undefined || isEnvVariableReference(value)) return []

    return [`${name} ("${field}")`]
  })

  if (literals.length === 0) return

  console.log(`
!! WARNING ------------------------------------------------------------------
!! externalApiConfigs holds ${literals.length === 1 ? 'a secret' : 'secrets'} in plain text: ${literals.join(', ')}
!! preferences.json is editable through the admin UI and is included in
!! snapshots and template exports. Prefer "env.MY_VAR", which is replaced at
!! request time with the environment variable of that name.
!! ---------------------------------------------------------------------------`)
}
