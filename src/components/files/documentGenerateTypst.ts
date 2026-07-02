/**
 * Typst-based PDF generation (see documentGenerate.ts for the Carbone
 * equivalent — generatePDF routes to one or the other based on the template
 * file's extension).
 *
 * A Typst document template is uploaded as a single ".typzip" file: a zip
 * bundle containing:
 *   - main.typ        (required) the template entry point
 *   - defaults.json   (required) fallback values for every data field the
 *                     template reads, deep-merged under the live data so
 *                     missing fields never crash a compile
 *   - sample.json     (optional) sample data, used by the (forthcoming)
 *                     bundle validation script, ignored here
 *   - any images/fonts/partial .typ files the template references, by path
 *     relative to the bundle root
 *
 * A bare ".typ" file (no assets) is also accepted, and treated as a
 * bundle-of-one.
 *
 * Since uploaded files are immutable (every upload gets a new uniqueId),
 * bundles are unpacked once into TYPST_CACHE_FOLDER/<fileId> and re-used
 * indefinitely. Deleting a cache folder is safe — it will be re-extracted on
 * next use.
 *
 * Font resolution is deterministic: system fonts are ignored, and only the
 * server's bundled FONTS_FOLDER, fonts inside the bundle itself, and the
 * fonts embedded in the typst binary are available. A template that renders
 * correctly in dev therefore cannot hit missing fonts in production.
 */

import path from 'path'
import fs from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'
import StreamZip from 'node-stream-zip'
import { nanoid } from 'nanoid'
import { FONTS_FOLDER, TYPST_CACHE_FOLDER } from '../../constants'
import { isObject, makeFolder } from '../utilityFunctions'

const execFileAsync = promisify(execFile)

const TYPST_BIN = process.env.TYPST_BIN ?? 'typst'
const TYPST_TIMEOUT_MS = 30_000
const MAIN_TEMPLATE_NAME = 'main.typ'
const DEFAULTS_NAME = 'defaults.json'

interface RenderTypstInput {
  fileId: string
  templateFullPath: string
  data: object
  outputFullPath: string
}

export const renderTypstPDF = async ({
  fileId,
  templateFullPath,
  data,
  outputFullPath,
}: RenderTypstInput) => {
  const bundleFolder = await prepareBundle(fileId, templateFullPath)

  const mergedData = await applyDefaults(bundleFolder, data)

  // The data file must live under the compile --root for the template to be
  // able to read it. Unique name per render so concurrent renders of the same
  // template can't collide.
  const dataFileName = `_data_${nanoid()}.json`
  await fs.promises.writeFile(path.join(bundleFolder, dataFileName), JSON.stringify(mergedData))

  const args = [
    'compile',
    '--root',
    bundleFolder,
    '--ignore-system-fonts',
    ...(fs.existsSync(FONTS_FOLDER) ? ['--font-path', FONTS_FOLDER] : []),
    '--font-path',
    bundleFolder,
    '--input',
    `datafile=/${dataFileName}`,
    path.join(bundleFolder, MAIN_TEMPLATE_NAME),
    outputFullPath,
  ]

  try {
    const { stderr } = await execFileAsync(TYPST_BIN, args, { timeout: TYPST_TIMEOUT_MS })
    // Typst emits non-fatal diagnostics (e.g. unknown font family) on stderr
    if (stderr) console.log(`Typst warnings for ${fileId}:\n${stderr}`)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT')
      throw new Error(
        `Typst CLI not found ("${TYPST_BIN}") -- is typst installed and on the server's PATH?`
      )
    if ((err as NodeJS.ErrnoException & { killed?: boolean }).killed)
      throw new Error(`Typst compile timed out after ${TYPST_TIMEOUT_MS}ms`)
    const stderr = (err as { stderr?: string }).stderr
    throw new Error(`Typst compile failed:\n${stderr || (err as Error).message}`)
  } finally {
    await fs.promises.unlink(path.join(bundleFolder, dataFileName)).catch(() => {})
  }
}

// Returns the path of the unpacked bundle folder for this template file,
// extracting it into the cache first if it's not already there
const prepareBundle = async (fileId: string, templateFullPath: string) => {
  const bundleFolder = path.join(TYPST_CACHE_FOLDER, fileId)
  if (fs.existsSync(bundleFolder)) return bundleFolder

  makeFolder(TYPST_CACHE_FOLDER)

  // Extract to a temp folder, then rename into place, so a concurrent render
  // can never see a partially-extracted bundle
  const tempFolder = path.join(TYPST_CACHE_FOLDER, `__extracting_${nanoid()}`)
  fs.mkdirSync(tempFolder)

  try {
    if (templateFullPath.toLowerCase().endsWith('.typ')) {
      // Bare .typ template — treat as a bundle containing only main.typ
      await fs.promises.copyFile(templateFullPath, path.join(tempFolder, MAIN_TEMPLATE_NAME))
    } else {
      const zip = new StreamZip.async({ file: templateFullPath })
      try {
        // Guard against zip-slip: no entry may resolve outside the bundle folder
        const entryNames = Object.keys(await zip.entries())
        const tempRoot = tempFolder + path.sep
        for (const name of entryNames) {
          if (!path.resolve(tempFolder, name).startsWith(tempRoot))
            throw new Error(`Invalid path in template bundle: ${name}`)
        }
        await zip.extract(null, tempFolder)
      } finally {
        await zip.close()
      }
    }

    if (!fs.existsSync(path.join(tempFolder, MAIN_TEMPLATE_NAME)))
      throw new Error(`Template bundle must contain ${MAIN_TEMPLATE_NAME} at its root level`)

    try {
      await fs.promises.rename(tempFolder, bundleFolder)
    } catch {
      // A concurrent render extracted the same bundle first -- use theirs
      if (!fs.existsSync(bundleFolder)) throw new Error(`Unable to create ${bundleFolder}`)
      await fs.promises.rm(tempFolder, { recursive: true, force: true })
    }
  } catch (err) {
    await fs.promises.rm(tempFolder, { recursive: true, force: true }).catch(() => {})
    throw err
  }

  return bundleFolder
}

// Merges the bundle's defaults.json (if present) underneath the live data
const applyDefaults = async (bundleFolder: string, data: object) => {
  const defaultsPath = path.join(bundleFolder, DEFAULTS_NAME)
  if (!fs.existsSync(defaultsPath)) return data

  let defaults: unknown
  try {
    defaults = JSON.parse(await fs.promises.readFile(defaultsPath, 'utf8'))
  } catch (err) {
    throw new Error(`Invalid ${DEFAULTS_NAME} in template bundle: ${(err as Error).message}`)
  }

  return mergeWithDefaults(data, defaults)
}

// Fills gaps in `data` from `defaults`: objects are merged recursively, but
// arrays and scalars present in `data` are used wholesale (a naive deep merge
// would blend default array entries into real rows, item by item). Defaults
// only apply where the live value is missing or null.
export const mergeWithDefaults = (data: unknown, defaults: unknown): unknown => {
  if (data === undefined || data === null) return defaults === undefined ? data : defaults
  if (isObject(data) && isObject(defaults)) {
    const dataObj = data as Record<string, unknown>
    const defaultsObj = defaults as Record<string, unknown>
    const result: Record<string, unknown> = { ...defaultsObj, ...dataObj }
    for (const key of Object.keys(defaultsObj))
      if (key in dataObj) result[key] = mergeWithDefaults(dataObj[key], defaultsObj[key])
    return result
  }
  return data
}
