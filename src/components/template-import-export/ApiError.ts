import { FastifyReply } from 'fastify'

export class ApiError extends Error {
  public status: number

  constructor(message: string, status: number, name?: string) {
    super(message)
    this.status = status
    if (name) this.name = name
  }
}

export const returnApiError = (err: unknown, reply: FastifyReply, statusCode?: number) => {
  if (err instanceof ApiError) {
    reply.statusCode = err.status
    return reply.send({ message: err.message })
  }

  reply.statusCode = statusCode ?? 500

  if (err instanceof Error) {
    return reply.send({ message: err.message })
  }

  if (typeof err === 'string') {
    return reply.send({ message: err })
  }
}
