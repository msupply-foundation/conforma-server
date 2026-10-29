// Types for AI document prefill. See DOCUMENT_PREFILL_SPEC.md.

// One form element, as described by the web-app (parameters already
// evaluated)
export interface PrefillElement {
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

export type PrefillValue = string | number | string[]

export interface PrefillAnswer {
  value: PrefillValue
  // 0-1
  confidence: number
  // Short quote from the document supporting the answer
  evidence: string
}

export type PrefillMediaType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'

export interface PrefillDocument {
  name: string
  mediaType: PrefillMediaType
  data: Buffer
}

export type PrefillEffort = 'low' | 'medium' | 'high' | 'xhigh' | 'max'

export interface PrefillOptions {
  model?: string
  effort?: PrefillEffort
  // Extra guidance from the template, e.g. what kind of document to expect
  instructions?: string
}

export interface PrefillUsage {
  // The model that produced the answer (differs from the requested model if
  // a refusal fallback ran)
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

export interface PrefillResult {
  // Keyed by element code; only questions the document answers
  answers: Record<string, PrefillAnswer>
  // Codes of elements that can't be prefilled (unsupported type, or a
  // choice element without options)
  skipped: string[]
  usage: PrefillUsage
}
