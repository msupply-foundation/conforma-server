import { FastifyReply } from 'fastify'
import { ApiError, returnApiError } from '../../ApiError'
import { checkApplicationAccess } from './checkApplicationAccess'
import { checkTemplateElements } from './checkTemplateElements'
import { extractAnswers } from './extractAnswers'
import { detectMediaType, parseElements } from './parseInput'
import { ExtractionDocument, ExtractionResult } from './types'

const MAX_FILES = 5
// All files in a request. Base64 encoding adds a third to the size sent to
// the API.
const MAX_TOTAL_SIZE_MB = 20
const MAX_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024

// The API key is the deployment's switch for AI features; which forms can use
// document extraction is decided by their templates
export const isAiAvailable = () => !!process.env.ANTHROPIC_API_KEY

const tooLarge = () =>
  new ApiError(`The documents are larger than ${MAX_TOTAL_SIZE_MB} MB in total`, 413)

const readRequest = async (request: any) => {

  const documents: ExtractionDocument[] = []
  const fields: Record<string, string> = {}
  let totalBytes = 0

  try {
    for await (const part of request.parts({ limits: { files: MAX_FILES, fileSize: MAX_BYTES } })) {
      if (part.type === 'field') {
        if (typeof part.value === 'string') fields[part.fieldname] = part.value
        continue
      }
      const data: Buffer = await part.toBuffer()
      totalBytes += data.length
      if (totalBytes > MAX_BYTES) throw tooLarge()

      const name = part.filename || `document ${documents.length + 1}`
      const mediaType = detectMediaType(data)
      if (!mediaType) throw new ApiError(`${name} is not a PDF, JPEG, PNG, GIF or WebP file`, 415)
      documents.push({ name, mediaType, data })
    }
  } catch (err) {
    // @fastify/multipart's own limit errors
    const code = (err as { code?: string })?.code
    if (code === 'FST_FILES_LIMIT') throw new ApiError(`Too many files (maximum ${MAX_FILES})`, 413)
    if (code === 'FST_REQ_FILE_TOO_LARGE') throw tooLarge()
    throw err
  }
  return { documents, fields }
}

const logUsage = (request: any, applicationSerial: string, result: ExtractionResult) => {
  const { answers, skipped, usage } = result
  const answered = Object.keys(answers).length
  console.log(
    `AI extraction: user ${request.auth?.userId}, application ${applicationSerial}, ` +
      `${usage.model}, ${usage.inputTokens} + ${usage.outputTokens} tokens, ` +
      `${answered} answered (${skipped.length} not supported), ` +
      `${(usage.durationMs / 1000).toFixed(1)}s`
  )
}

/**
 * Reads the uploaded documents and answers as many of the given elements'
 * questions as it can, for an application the caller can edit whose form uses
 * AI document fill. The elements must be questions of that form. Doesn't change
 * application data: the web-app saves the answers through GraphQL, so
 * permissions and validation apply as for any edit. See
 * AI_DOCUMENT_FILL_SPEC.md.
 */
export const routeAiExtract = async (request: any, reply: FastifyReply) => {
  try {
    if (!isAiAvailable()) throw new ApiError('AI is not enabled on this server', 404)

    const { documents, fields } = await readRequest(request)
    const { serial: applicationSerial, templateId } = await checkApplicationAccess(
      request.auth,
      fields.applicationSerial
    )
    const elements = parseElements(fields.elements)
    await checkTemplateElements(templateId, elements)

    const result = await extractAnswers(documents, elements, {
      instructions: fields.instructions,
    })

    logUsage(request, applicationSerial, result)
    return reply.send(result)
  } catch (err) {
    // Other @fastify/multipart errors carry their own status code
    const statusCode = (err as { statusCode?: number })?.statusCode
    return returnApiError(err, reply, statusCode)
  }
}
