import { FastifyReply } from 'fastify'

/**
 * A standardised Error object to return from the API whenever something is
 * incorrect. We should eventually move to using this for all API routes.
 *
 * Currently only implemented for:
 * - Template Import/Export
 */

export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number, name?: string) {
    super(message)
    this.status = status
    if (name) this.name = name
    console.log(`API Error: ${message}`)
  }
}

const logError = (message: string) => console.log('ERROR: ' + message)

/**
 * Sends an error response on `reply` and returns the reply object. The `return`
 * inside this function only exits *this* function — it does NOT stop the
 * calling route handler. So in a route, prefer:
 *
 *   return returnApiError(...)            // or: returnApiError(...); return
 *
 * whenever there is any code (or a try/catch) after the call that could reach
 * another `reply.send()`. Fastify silently drops the second send and logs
 * "Reply already sent", but the intervening code still runs (wasted DB work,
 * misleading error logs).
 *
 * It's only safe to call `returnApiError(...)` without an explicit return when
 * nothing else in the handler can reach another send — e.g. the last line of
 * a `catch` block at the end of the function.
 */
export const returnApiError = (err: unknown, reply: FastifyReply, statusCode?: number) => {
  if (err instanceof ApiError) {
    reply.statusCode = err.status
    logError(err.message)
    return reply.send({ message: err.message })
  }

  reply.statusCode = statusCode ?? 500

  if (err instanceof Error) {
    logError(err.message)
    return reply.send({ message: err.message })
  }

  if (typeof err === 'string') {
    logError(err)
    return reply.send({ message: err })
  }
}
