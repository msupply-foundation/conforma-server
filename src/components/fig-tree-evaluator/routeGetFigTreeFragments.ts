import { FastifyReply, FastifyRequest } from 'fastify'
import DBConnect from '../database/databaseConnect'

type FragmentRequest = {
  Params: { frontOrBack: 'front' | 'back' }
}

export const routeGetFigTreeFragments = async (
  request: FastifyRequest<FragmentRequest>,
  reply: FastifyReply
) => {
  const { frontOrBack } = request.params

  const { auth } = request as FastifyRequest<FragmentRequest> & { auth: { isAdmin: boolean } }

  if (frontOrBack === 'back' && !auth.isAdmin) {
    reply.status(403)
    return reply.send('Must be Admin')
  }

  const result = (
    await DBConnect.query({
      text: `
        SELECT name, expression FROM evaluator_fragment
        WHERE ${frontOrBack === 'back' ? 'back_end' : 'front_end'} = TRUE;`,
    })
  ).rows

  const fragments = result.reduce((acc, fragment) => {
    return { ...acc, [fragment.name]: fragment.expression }
  }, {})

  return reply.send(fragments)
}
