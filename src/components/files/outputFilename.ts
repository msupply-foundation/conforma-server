/**
 * Filename construction for generated PDF documents (used by generatePDF in
 * documentGenerate.ts). Deliberately import-free so it can be unit-tested
 * without pulling in config, carbone or the database connection.
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

const MAX_BASE_LENGTH = 80
const FALLBACK_BASE = 'document'

// Adapted from sanitizeBaseName in stagedDownloads/stagedDownload.ts. The
// value can come from application data (via a template expression), so it
// must never be able to escape the files folder or break a header. Unlike the
// staged-download version, spaces are kept — a readable download name is the
// point of the "filename" parameter.
const sanitiseBaseName = (name: string): string =>
  name
    .replace(/[\\/]/g, '_') // path separators
    .replace(/\.{2,}/g, '_') // runs of dots (path traversal)
    .replace(/[\x00-\x1f\x7f]/g, '') // control chars (invisible, so just drop them)
    .replace(/[<>:"|?*]/g, '_') // Windows-reserved chars
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_BASE_LENGTH)
    .replace(/^[._\s]+|[._\s]+$/g, '')

interface OutputFilenameInput {
  /** Requested download name. Anything other than a usable string falls back to the default. */
  filename?: unknown
  /** The document template's filename without extension */
  templateName: string
  applicationSerial?: string
  uniqueId: string
}

export const buildOutputFilenames = ({
  filename,
  templateName,
  applicationSerial,
  uniqueId,
}: OutputFilenameInput): { originalFilename: string; outputFilename: string } => {
  const custom =
    typeof filename === 'string' ? sanitiseBaseName(filename.trim().replace(/\.pdf$/i, '')) : ''
  const defaultBase = `${templateName}${applicationSerial ? '_' + applicationSerial : ''}`
  const base = custom || sanitiseBaseName(defaultBase) || FALLBACK_BASE

  return {
    originalFilename: `${base}.pdf`,
    outputFilename: `${base}_${uniqueId}.pdf`,
  }
}
