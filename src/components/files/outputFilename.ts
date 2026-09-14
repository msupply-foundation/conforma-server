/**
 * Filename construction for generated PDF documents (used by generatePDF in
 * documentGenerate.ts). Kept free of carbone and database imports so it can be
 * unit-tested cheaply.
 *
 * Two names are produced for every generated document:
 *
 *  - originalFilename: what the user sees when downloading (stored as
 *    file.original_filename). Configurable via the generateDoc "filename"
 *    parameter. It must NEVER contain the file's uniqueId — knowing that ID is
 *    enough to download the file, so it mustn't leak into a name people
 *    forward around.
 *
 *  - outputFilename: the on-disk name (file.file_path). Always suffixed with
 *    the uniqueId so regenerating the same document for the same application
 *    can't overwrite the previous one.
 */
import { sanitiseFilenameBase } from '../utilityFunctions'

const FALLBACK_BASE = 'document'

interface OutputFilenameInput {
  /** Requested download name. Anything other than a usable string falls back to the default. */
  filename?: unknown
  /** The document template's filename without extension (the file docTemplateId points at) */
  docTemplateName: string
  applicationSerial?: string
  uniqueId: string
}

export const buildOutputFilenames = ({
  filename,
  docTemplateName,
  applicationSerial,
  uniqueId,
}: OutputFilenameInput): { originalFilename: string; outputFilename: string } => {
  // The value can come from application data via a template expression, so it
  // must never be able to escape the files folder or break a header. Spaces are
  // kept — a readable download name is the point of the "filename" parameter.
  const custom =
    typeof filename === 'string' ? sanitiseFilenameBase(filename.trim().replace(/\.pdf$/i, '')) : ''
  const defaultBase = `${docTemplateName}${applicationSerial ? '_' + applicationSerial : ''}`
  const base = custom || sanitiseFilenameBase(defaultBase) || FALLBACK_BASE

  return {
    originalFilename: `${base}.pdf`,
    outputFilename: `${base}_${uniqueId}.pdf`,
  }
}
