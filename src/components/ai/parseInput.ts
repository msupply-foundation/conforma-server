import { ApiError } from '../../ApiError'
import { ExtractionElement, ExtractionMediaType } from './types'

const MAX_ELEMENTS = 500

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === 'string'

/**
 * Parses the element definitions sent by the web-app. Copies only the known
 * fields, so nothing else reaches the prompt.
 */
export const parseElements = (json: string | undefined): ExtractionElement[] => {
  if (!json) throw new ApiError('Missing "elements"', 400)

  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new ApiError('"elements" is not valid JSON', 400)
  }
  if (!Array.isArray(parsed) || parsed.length === 0)
    throw new ApiError('"elements" must be a non-empty array', 400)
  if (parsed.length > MAX_ELEMENTS)
    throw new ApiError(`Too many elements (maximum ${MAX_ELEMENTS})`, 400)

  return parsed.map((item, index) => parseElement(item, `Element ${index}`, true))
}

// A list's fields are elements too, but can't be lists themselves
const parseElement = (item: unknown, name: string, canHaveFields: boolean): ExtractionElement => {
  if (
    !isRecord(item) ||
    !isString(item.code) ||
    !isString(item.pluginCode) ||
    !isString(item.title)
  )
    throw new ApiError(`${name} needs a string code, pluginCode and title`, 400)

  const {
    code,
    pluginCode,
    title,
    helpText,
    isRequired,
    options,
    multiSelect,
    currentValue,
    fields,
    maxItems,
  } = item
  if (options !== undefined && !(Array.isArray(options) && options.every(isString)))
    throw new ApiError(`Element "${code}" options must be an array of strings`, 400)
  if (fields !== undefined && !(canHaveFields && Array.isArray(fields) && fields.length > 0))
    throw new ApiError(`Element "${code}" fields must be a non-empty array, and not nested`, 400)

  return {
    code,
    pluginCode,
    title,
    ...(isString(helpText) ? { helpText } : {}),
    ...(typeof isRequired === 'boolean' ? { isRequired } : {}),
    ...(options ? { options } : {}),
    ...(multiSelect === true ? { multiSelect } : {}),
    ...(isString(currentValue) ? { currentValue } : {}),
    ...(fields
      ? {
          fields: (fields as unknown[]).map((field, index) =>
            parseElement(field, `Field ${index} of "${code}"`, false)
          ),
        }
      : {}),
    ...(Number.isInteger(maxItems) && (maxItems as number) > 0
      ? { maxItems: maxItems as number }
      : {}),
  }
}

/**
 * Identifies a document from its first bytes rather than its name or
 * declared type, so a renamed file (e.g. an iPhone HEIC photo saved as .jpg)
 * is rejected here instead of failing at the API. Returns undefined for
 * anything the model can't read.
 */
export const detectMediaType = (data: Buffer): ExtractionMediaType | undefined => {
  const ascii = (start: number, end: number) => data.subarray(start, end).toString('latin1')

  // A PDF header may follow up to 1 KB of other bytes
  if (data.subarray(0, 1024).includes('%PDF-')) return 'application/pdf'
  if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) return 'image/jpeg'
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return 'image/png'
  if (['GIF87a', 'GIF89a'].includes(ascii(0, 6))) return 'image/gif'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp'
  return undefined
}
