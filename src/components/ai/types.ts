// Types for AI document extraction. See AI_DOCUMENT_FILL_SPEC.md.

// One form element, as described by the web-app (parameters already
// evaluated)
export interface ExtractionElement {
  code: string
  pluginCode: string
  title: string
  helpText?: string
  isRequired?: boolean
  // Display labels, for choice elements
  options?: string[]
  // dropdownChoice only
  multiSelect?: boolean
  // The response's `text`, if the question is already answered
  currentValue?: string | null
}

export type ExtractionValue = string | number | string[]

export interface ExtractionAnswer {
  value: ExtractionValue
  // 0-1
  confidence: number
  // Short quote from the document supporting the answer
  evidence: string
}

export type ExtractionMediaType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'

export interface ExtractionDocument {
  name: string
  mediaType: ExtractionMediaType
  data: Buffer
}

export type ExtractionEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface ExtractionOptions {
  model?: string
  effort?: ExtractionEffort
  // Extra guidance from the template, e.g. what kind of document to expect
  instructions?: string
}

export interface ExtractionUsage {
  // The model that produced the answer (differs from the requested model if
  // a refusal fallback ran)
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

export interface ExtractionResult {
  // Keyed by element code; only questions the document answers
  answers: Record<string, ExtractionAnswer>
  // Codes of elements that weren't asked (unsupported type, or a
  // choice element without options)
  skipped: string[]
  usage: ExtractionUsage
}
