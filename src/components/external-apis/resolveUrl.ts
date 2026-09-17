import { URL } from 'url'

/*
Joins a route or login url onto an API's base url.

`new URL(url, base)` follows RFC 3986 relative resolution, which is a trap for
configuration: a base without a trailing slash loses its last path segment
("…/api/v4" + "login" → "…/api/login"), and a url with a leading slash
discards the base path altogether ("…/api/v4/" + "/login" → "…/login").
Both are natural things to write, so both are normalised away: the base always
ends in "/", the url never starts with one, and the join is a plain path append.

An absolute url still wins outright, as relative resolution has it.
*/
export const resolveApiUrl = (baseUrl: string, url: string) =>
  new URL(url.replace(/^\/+/, ''), baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString()
