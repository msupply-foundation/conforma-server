/*
The auth activity log. Kept in one place so the lines share a prefix and can be
grepped as a set, and so the rule about what may appear in them lives somewhere
rather than being remembered at each call site.

NEVER log a credential. Both tokens are bearer credentials, and a log is
copied, shipped and pasted into issues far more freely than a cookie jar is.
Sessions are identified here by a short prefix of the token HASH instead: it is
a one-way digest, it is already the session's primary key, and it is long
enough to tell one of a user's sessions from another while being useless to
anyone who reads it.

Usernames are quoted rather than interpolated bare, because on the failure
paths they are unvalidated request input -- quoting keeps a newline in a
submitted username from forging a log line, and makes an empty or
whitespace-only one visible.
*/

const PREFIX = '[auth]'

// Enough to tell sessions apart in a log without crowding the line
const SESSION_REF_LENGTH = 8

export const authLog = (...parts: unknown[]) => console.log(PREFIX, ...parts)

// Bare, so a caller listing several can label them once
export const sessionRef = (tokenHash: string) => tokenHash.slice(0, SESSION_REF_LENGTH)

export const quoted = (username: unknown) => JSON.stringify(String(username ?? ''))

// Deadlines are logged with the date as well as the time, since the question
// asked of them is "has that passed?" and a session window may be days long.
// Local rather than UTC, to match the clock of whoever is reading, and in a
// sortable unambiguous shape -- which is what the Swedish locale concisely
// asks for. toISOString would report UTC, and the default locale gives
// "9/4/2026", which is a different date depending on the reader.
export const asTime = (date: Date) => date.toLocaleString('sv-SE')
