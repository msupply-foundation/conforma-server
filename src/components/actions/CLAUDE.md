# actions/ — triggers → actions runtime

Conforma's automation engine. Database **triggers** (events like `ON_APPLICATION_SUBMIT`) enqueue **actions** (plugins) that run in response — sending notifications, changing status/stage, generating documents, granting permissions, etc. This folder is the *runtime*; the plugins themselves live in [`plugins/`](../../../plugins/CLAUDE.md). (Repo overview: [../../../CLAUDE.md](../../../CLAUDE.md). Concepts: [../../../documentation/Triggers-and-Actions.md](../../../documentation/Triggers-and-Actions.md).)

## Flow: trigger → action

1. A `trigger` column is set on a row in `application`, `review`, `review_assignment`, `verification`, or `trigger_schedule` (by the app, by SQL, or by another action).
2. A DB trigger inserts a row into **`trigger_queue`** (status `TRIGGERED`); a `pg_notify` wakes a Node listener that feeds the event into `EventThrottle`.
3. `EventThrottle` ([throttle.ts](throttle.ts)) serialises bursts of events so the system isn't overwhelmed, then calls **`processTrigger`** ([processTrigger.ts](processTrigger.ts)).
4. `processTrigger` looks up the template's actions (`template_action`) for that trigger and writes rows to **`action_queue`**, splitting them into:
   - **Async** actions → status `Queued`, run independently (a pg_notify listener picks them up).
   - **Sequential** actions → status `Processing`, run one-by-one in order; each receives the prior actions' merged output via `outputCumulative`.
   - **Core actions** ([coreActions.ts](coreActions.ts)) are injected automatically (e.g. serial generation on create). They have *fixed* `sequence` numbers — usually negative so they run first, but some are positive (e.g. increment-stage / generate-review-assignments on review submit) so they run *after* the template's own actions.
5. **`executeAction`** ([executeAction.ts](executeAction.ts)) evaluates each action's `condition_expression` and `parameter_queries` with the **fig-tree evaluator** (against fresh `applicationData`), then invokes the plugin function from the global `actionLibrary`.
6. On success the source row's `trigger` is reset to `NULL`; on failure it becomes `ERROR`, and remaining sequential actions are skipped. (Meanwhile the `trigger_queue` row's status moves `TRIGGERED` → `ACTIONS_DISPATCHED` → `COMPLETED`/`ERROR`.)

## Key files

| File | Role |
| --- | --- |
| [processTrigger.ts](processTrigger.ts) | Entry point: fetch template actions, split async/sequential, enqueue, run the sequential chain |
| [executeAction.ts](executeAction.ts) | Evaluate condition + parameters, call the plugin, update `action_queue` status |
| [getApplicationData.ts](getApplicationData.ts) | Build the `applicationData` object (user, org, responses, review data, env) passed to every plugin |
| [coreActions.ts](coreActions.ts) | Hard-coded system actions injected per trigger |
| [helpers.ts](helpers.ts) | Resolves the `alias` action type (swap in the real action + merge override params) |
| [throttle.ts](throttle.ts) | `EventThrottle` — queues concurrent trigger events |
| [resumeProcessing.ts](resumeProcessing.ts) | On startup, replays triggers left queued when the server stopped |

[loadActions.ts](loadActions.ts) (in this folder) and `pluginsConnect.ts` (in `../`) populate `actionLibrary[code]` at startup by importing each registered plugin.

## Scheduler ([../scheduler.ts](../scheduler.ts))

A single global `Schedulers` instance (on `config.scheduledJobs`) runs `node-schedule` jobs: scheduled-action polling (reads `trigger_schedule` and enqueues due actions), file cleanup, backup, archive, and stale-application cleanup. Timings come from server preferences and can be re-scheduled at runtime (`refreshConfig` → `Schedulers.reschedule`). A hard-coded dev flag in `scheduler.ts` can switch jobs to a short (~30s) interval for testing.

## Testing triggers & actions (dev)

Admin/dev-only REST routes (registered in [../../server.ts](../../server.ts)):

- `POST /api/admin/run-action` — run a single action directly.
- `POST /api/admin/test-trigger` — fire a trigger.
- `POST /api/preview-actions` — preview action output without committing.

See [../../../documentation/Trigger-Testing-Tool.md](../../../documentation/Trigger-Testing-Tool.md).

## Gotchas

- **Conditions & parameters are stored as fig-tree expression objects** (not strings) and evaluated at execution time — so they can read live `applicationData` and prior `outputCumulative`.
- **`applicationData` is regenerated between sequential actions** — each one sees the DB state left by the previous action.
- **Sequence matters**: sequential actions run strictly in ascending `sequence` order — core actions are *injected* at fixed sequences, not guaranteed first. One sequential failure aborts the rest of the chain.
- A new plugin must be **registered and compiled** before it can run — see [plugins/CLAUDE.md](../../../plugins/CLAUDE.md).
