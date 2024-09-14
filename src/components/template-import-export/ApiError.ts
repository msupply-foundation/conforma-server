import { FastifyReply } from 'fastify'

export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number, name?: string) {
    super(message)
    this.status = status
    if (name) this.name = name
  }
}

const logError = (message: string) => console.log('ERROR: ' + message)

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
