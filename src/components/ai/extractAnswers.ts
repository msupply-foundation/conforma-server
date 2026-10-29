import Anthropic from '@anthropic-ai/sdk'
import { ApiError } from '../../ApiError'
import { checkAnswers } from './checkAnswers'
import { buildOutputSchema, splitSupported } from './elementSchema'
import { buildFormDescription, SYSTEM_PROMPT } from './prompt'
import { PrefillDocument, PrefillElement, PrefillOptions, PrefillResult } from './types'

type ContentBlock = Anthropic.Beta.BetaContentBlockParam

const DEFAULT_MODEL = 'claude-opus-5-5'
const DEFAULT_EFFORT = 'medium'

// Thinking counts towards this, and every question gets an answer object
// (even when not found), so leave plenty of room
const MAX_TOKENS = 64000

let client: Anthropic | undefined

const getClient = () => {
  if (!process.env.ANTHROPIC_API_KEY)
    throw new ApiError('AI prefill is not configured (ANTHROPIC_API_KEY is not set)', 503)
  if (!client) client = new Anthropic()
  return client
}

// Each document is preceded by its name so the model can cite it in
// `evidence`
const toContentBlocks = ({ name, mediaType, data }: PrefillDocument): ContentBlock[] => {
  const label: ContentBlock = { type: 'text', text: `Document: ${name}` }
  const base64 = data.toString('base64')
  if (mediaType === 'application/pdf')
    return [
      label,
      { type: 'document', source: { type: 'base64', media_type: mediaType, data: base64 } },
    ]
  return [label, { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } }]
}

const callModel = async (params: Anthropic.Beta.MessageCreateParamsStreaming) => {
  try {
    return await getClient().beta.messages.stream(params).finalMessage()
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError)
      throw new ApiError('AI prefill is not configured correctly (API key rejected)', 503)
    if (err instanceof Anthropic.RateLimitError)
      throw new ApiError('The AI service is busy, please try again shortly', 429)
    if (err instanceof Anthropic.APIError)
      throw new ApiError(`AI request failed: ${err.message}`, 502)
    throw err
  }
}

/**
 * Reads the documents and answers as many of the elements' questions as it
 * can. Elements that can't be prefilled are returned in `skipped`.
 */
export const extractAnswers = async (
  documents: PrefillDocument[],
  elements: PrefillElement[],
  options: PrefillOptions = {}
): Promise<PrefillResult> => {
  if (documents.length === 0) throw new ApiError('No documents provided', 400)

  const { supported, skipped } = splitSupported(elements)
  if (supported.length === 0) throw new ApiError('None of these questions can be prefilled', 400)

  const start = Date.now()
  const message = await callModel({
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: MAX_TOKENS,
    stream: true,
    // On a policy refusal, the API retries on its default fallback model
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM_PROMPT,
    output_config: {
      effort: options.effort ?? DEFAULT_EFFORT,
      format: { type: 'json_schema', schema: buildOutputSchema(supported) },
    },
    messages: [
      {
        role: 'user',
        content: [
          ...documents.flatMap(toContentBlocks),
          { type: 'text', text: buildFormDescription(supported, options.instructions) },
        ],
      },
    ],
  })

  if (message.stop_reason === 'refusal')
    throw new ApiError('The AI model declined to process this document', 422)
  if (message.stop_reason === 'max_tokens')
    throw new ApiError('The AI response was cut off before it finished', 502)

  const text = message.content.find((block) => block.type === 'text')
  if (!text || text.type !== 'text') throw new ApiError('The AI model returned no answers', 502)

  return {
    answers: checkAnswers(supported, JSON.parse(text.text)),
    skipped,
    usage: {
      model: message.model,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      durationMs: Date.now() - start,
    },
  }
}
