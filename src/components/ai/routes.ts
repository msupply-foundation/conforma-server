import { FastifyReply } from 'fastify'
import config from '../../config'
import { ApiError, returnApiError } from '../../ApiError'
import { extractAnswers } from './extractAnswers'
import { detectMediaType, parseElements } from './parseInput'
import { PrefillDocument, PrefillResult } from './types'

const DEFAULT_MAX_FILES = 5
// Base64 encoding adds a third to the size sent to the API
const DEFAULT_MAX_TOTAL_SIZE_MB = 20

// Needs both, so that a key in a deployment's environment doesn't switch the
// feature on by itself
export const isAiPrefillAvailable = () =>
  !!config.aiPrefill?.enabled && !!process.env.ANTHROPIC_API_KEY

const readRequest = async (request: any) => {
  const { maxFiles = DEFAULT_MAX_FILES, maxTotalSizeMB = DEFAULT_MAX_TOTAL_SIZE_MB } =
    config.aiPrefill ?? {}
  const maxBytes = maxTotalSizeMB * 1024 * 1024

  const tooLarge = () =>
    new ApiError(`The documents are larger than ${maxTotalSizeMB} MB in total`, 413)

  const documents: PrefillDocument[] = []
  const fields: Record<string, string> = {}
  let totalBytes = 0

  try {
    for await (const part of request.parts({ limits: { files: maxFiles, fileSize: maxBytes } })) {
      if (part.type === 'field') {
        if (typeof part.value === 'string') fields[part.fieldname] = part.value
        continue
      }
      const data: Buffer = await part.toBuffer()
      totalBytes += data.length
      if (totalBytes > maxBytes) throw tooLarge()

      const name = part.filename || `document ${documents.length + 1}`
      const mediaType = detectMediaType(data)
      if (!mediaType) throw new ApiError(`${name} is not a PDF, JPEG, PNG, GIF or WebP file`, 415)
      documents.push({ name, mediaType, data })
    }
  } catch (err) {
    // @fastify/multipart's own limit errors
    const code = (err as { code?: string })?.code
    if (code === 'FST_FILES_LIMIT') throw new ApiError(`Too many files (maximum ${maxFiles})`, 413)
    if (code === 'FST_REQ_FILE_TOO_LARGE') throw tooLarge()
    throw err
  }
  return { documents, fields }
}

const logUsage = (request: any, applicationSerial: string | undefined, result: PrefillResult) => {
  const { answers, skipped, usage } = result
  const answered = Object.keys(answers).length
  console.log(
    `AI prefill: user ${request.auth?.userId}, application ${applicationSerial ?? '-'}, ` +
      `${usage.model}, ${usage.inputTokens} + ${usage.outputTokens} tokens, ` +
      `${answered} answered (${skipped.length} not supported), ` +
      `${(usage.durationMs / 1000).toFixed(1)}s`
  )
}

/**
 * Reads the uploaded documents and answers as many of the given elements'
 * questions as it can. Doesn't read or write application data: the web-app
 * saves the answers through GraphQL, so permissions and validation apply as
 * for any edit. See DOCUMENT_PREFILL_SPEC.md.
 */
export const routeAiPrefill = async (request: any, reply: FastifyReply) => {
  try {
    if (!isAiPrefillAvailable()) throw new ApiError('AI prefill is not enabled', 404)

    const { documents, fields } = await readRequest(request)
    const elements = parseElements(fields.elements)

    const result = await extractAnswers(documents, elements, {
      model: config.aiPrefill?.model,
      effort: config.aiPrefill?.effort,
      instructions: fields.instructions,
    })

    logUsage(request, fields.applicationSerial, result)
    return reply.send(result)
  } catch (err) {
    // Other @fastify/multipart errors carry their own status code
    const statusCode = (err as { statusCode?: number })?.statusCode
    return returnApiError(err, reply, statusCode)
  }
}
