# Key Decision Documents (KDD)

A KDD records a **technical decision and why we made it** — the fork we hit, the alternative we rejected, and the evidence. It is the durable _why the code is shaped this way_, so a later reader (human or agent) doesn't "improve" a deliberate choice back into the obvious default.

It complements the other bodies of knowledge in this repo:

| Layer | Question | Home |
| --- | --- | --- |
| **Reference / how-to** | How does this subsystem work? | [`documentation/`](../documentation/) (published to the [wiki](https://github.com/msupply-foundation/conforma-server/wiki)) |
| **Orientation** | Where does this live, what should I watch out for? | the `CLAUDE.md` files |
| **WHY** | Why is the code shaped this way? | `kdd/` (here) |

Format and conventions follow the sibling [`open-msupply-frontend/kdd/`](https://github.com/msupply-foundation/open-msupply-frontend/tree/main/kdd) — read its README for the full rationale. In short:

- **Write one when there was a plausible alternative you are deliberately not taking** and the code alone can't defend the choice. No real fork? Don't write it down.
- **Cluster related decisions into one KDD** rather than atomising into stubs.
- **Status lifecycle:** `Draft` (proposed) → `Accepted` (in force) → `Superseded by <link>` (keep the file; a reversed decision stays on record).
- **Folder names are stable.** Cite a decision from code by folder path (`kdd/auth-token-lifecycle`), not a deep link to `draft-kdd.md`, so references survive the draft→accepted rename.

## Index

| KDD | Status | In one line |
| --- | --- | --- |
| [`auth-token-lifecycle/`](./auth-token-lifecycle/draft-kdd.md) | Draft | One access token, issued and verified the same way for every caller: add `exp` so REST and GraphQL both reject expired tokens through the same check (today REST calculates expiry itself, and GraphQL enforces nothing). A `user_session` table backs browser sessions, with revocation by row deletion; **both tokens are HttpOnly cookies**, translated to a bearer header by a thin middleware in front of PostGraphile that also renews them silently, so no token ever enters JavaScript. Renewal is triggered by rejection and extends the session; expiry is pushed to idle clients over the existing websocket. Machine clients (mSupply, a peer Conforma) are ordinary non-admin service accounts. Public forms keep working: they share one account and are isolated by an RLS policy on `sessionId`, which the session must therefore preserve exactly. `externalApiConfigs` gains support for credentials that expire. **One open question:** whether a machine client's durable secret is a password or a provisioned session credential. Driven by [conforma-templates#342](https://github.com/msupply-foundation/conforma-templates/issues/342). |
