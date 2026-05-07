/**
 * Staged downloads — generic mechanism for serving auth-gated files via the
 * browser's native download path.
 *
 * The flow: an authenticated route produces a file, calls
 * `stageFileForDownload` to move it into the staging folder, and returns the
 * resulting URL to the client. The client opens that URL via a plain `<a>`
 * click and gets native browser download progress + streaming-to-disk. The
 * URL is a capability — anyone with it can download the file once.
 *
 * Lifecycle: each staged file gets a 30-min absolute hard-delete timer, plus
 * a 5-min soft-delete timer triggered when the public route finishes serving.
 * Whichever fires first wins; both are no-ops if the file is already gone.
 *
 * On server boot, the staging folder is wiped (see createDefaultFolders) — we
 * don't try to recover in-progress downloads across restarts.
 */

import fsx from 'fs-extra'
import path from 'path'
import { customAlphabet } from 'nanoid'
import { STAGED_DOWNLOAD_FOLDER } from '../../constants'

const HARD_TIMEOUT_MS = 30 * 60_000
const SOFT_TIMEOUT_MS = 5 * 60_000

const TOKEN_ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const TOKEN_LENGTH = 24
const TOKEN_PATTERN = new RegExp(`^[${TOKEN_ALPHABET}]{${TOKEN_LENGTH}}$`)

const generateToken = customAlphabet(TOKEN_ALPHABET, TOKEN_LENGTH)

interface TimerEntry {
  hardTimer: NodeJS.Timeout
  softTimer?: NodeJS.Timeout
  onDiskName: string
}

const timers = new Map<string, TimerEntry>()

const sanitizeBaseName = (name: string): string => {
  const cleaned = name
    .replace(/[\\/]/g, '_') // path separators
    .replace(/\.{2,}/g, '_') // collapse runs of dots (path-traversal)
    .replace(/[\x00-\x1f<>:"|?*]/g, '_') // control + Windows-reserved
    .replace(/\s+/g, '_')
    .replace(/^[._]+|[._]+$/g, '')
    .slice(0, 80)
  return cleaned || 'file'
}

const sanitizeExtension = (ext: string): string =>
  // path.parse(...).ext includes the leading dot; cap to keep things tidy
  ext.replace(/[^A-Za-z0-9.]/g, '').slice(0, 16)

const buildOnDiskName = (token: string, displayFilename: string): string => {
  const parsed = path.parse(displayFilename)
  return `${sanitizeBaseName(parsed.name)}_${token}${sanitizeExtension(parsed.ext)}`
}

const forceDelete = async (token: string) => {
  const entry = timers.get(token)
  if (!entry) return
  clearTimeout(entry.hardTimer)
  if (entry.softTimer) clearTimeout(entry.softTimer)
  timers.delete(token)
  try {
    await fsx.remove(path.join(STAGED_DOWNLOAD_FOLDER, entry.onDiskName))
  } catch {
    // already gone
  }
}

export const isValidStagedToken = (token: unknown): token is string =>
  typeof token === 'string' && TOKEN_PATTERN.test(token)

/**
 * Returns the absolute on-disk path for a staged file, or `null` if the
 * token is unknown (already-served + cleaned, expired, or never existed).
 */
export const getStagedFilePath = (token: string): string | null => {
  const entry = timers.get(token)
  if (!entry) return null
  return path.join(STAGED_DOWNLOAD_FOLDER, entry.onDiskName)
}

/**
 * Place a file in the staging folder and return the public URL the client
 * should download it from. By default the source file is preserved (copied);
 * pass `consumeSource: true` for callers that produced a throwaway temp file
 * and don't need it kept (cheaper — a rename within the same filesystem).
 *
 * `displayFilename` is what the user sees when the browser saves the file
 * (the client supplies it as `?filename=` on the download URL), and it also
 * shapes the on-disk filename — `<sanitized-base>_<token><.ext>` — so an
 * operator inspecting the staging folder can tell at a glance what's there.
 */
export const stageFileForDownload = async (
  sourcePath: string,
  displayFilename: string,
  { consumeSource = false }: { consumeSource?: boolean } = {}
): Promise<{ url: string }> => {
  const token = generateToken()
  const onDiskName = buildOnDiskName(token, displayFilename)
  const stagedPath = path.join(STAGED_DOWNLOAD_FOLDER, onDiskName)

  if (consumeSource) await fsx.move(sourcePath, stagedPath)
  else await fsx.copy(sourcePath, stagedPath)

  const hardTimer = setTimeout(() => {
    forceDelete(token)
  }, HARD_TIMEOUT_MS)
  hardTimer.unref()
  timers.set(token, { hardTimer, onDiskName })

  return { url: `/public/staged-download/${token}` }
}

/**
 * Called by the public download route once the response stream has closed.
 * Schedules the file for deletion after a short grace period, allowing for
 * download managers / quick re-requests.
 */
export const markStagedDownloadServed = (token: string) => {
  const entry = timers.get(token)
  if (!entry) return
  if (entry.softTimer) clearTimeout(entry.softTimer)
  const softTimer = setTimeout(() => {
    forceDelete(token)
  }, SOFT_TIMEOUT_MS)
  softTimer.unref()
  entry.softTimer = softTimer
}
