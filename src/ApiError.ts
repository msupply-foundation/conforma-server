import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

/**
 * A standardised Error object to throw from anywhere in the API request
 * lifecycle when something is incorrect. Pair it with `apiErrorHandler`
 * (registered via `fastify.setErrorHandler`) to translate into a response.
 *
 * Throw from route handlers, operations, or utilities:
 *
 *   throw new ApiError('Invalid template id', 400)
 *
 * Fastify auto-catches throws from async handlers and routes them through
 * the error handler below.
 */

export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number, name?: string) {
    super(message)
    this.status = status
    if (name) this.name = name
  }
}

export const apiErrorHandler = (
  err: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply
) => {
  if (err instanceof ApiError) {
    console.log(`API Error (${err.status}): ${err.message}`)
    return reply.status(err.status).send({ message: err.message })
  }

  // Fastify's own 4xx (schema validation, body limits, 404, etc.) carry statusCode
  if (err.statusCode && err.statusCode < 500) {
    return reply.status(err.statusCode).send({ message: err.message })
  }

  // Anything else is unexpected — log loudly, mask details from the client
  console.error('Unhandled server error:', err)
  return reply.status(500).send({ message: 'Internal server error' })
}
