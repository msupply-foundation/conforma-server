/**
 * Typst document template bundle validator
 *
 * Validates `.typzip` document template bundles before they're uploaded to a
 * Conforma instance. A `.typzip` is a zip archive containing:
 *   - main.typ        (required) the template entry point
 *   - defaults.json   (required) fallback values for every data field the
 *                     template reads — deep-merged under the live action data
 *                     at render time so missing fields never crash a compile
 *   - sample.json     (optional) realistic sample data for preview/testing
 *   - any images/fonts/assets/partial .typ files the template references
 *     (paths relative to the bundle root)
 *
 * Usage:
 *   yarn validateTypst <path> [<path> ...]
 *
 * where each <path> can be:
 *   - a .typzip bundle file
 *   - an *unpacked* bundle folder (contains main.typ) — on success, a
 *     ready-to-upload <folder>.typzip is written alongside it
 *   - a bare .typ template (validated with no data — only useful for
 *     templates that read no data fields)
 *   - a folder containing any of the above (scanned one level deep)
 *
 * Checks, per bundle:
 *   1. Structure: main.typ and defaults.json at the bundle root,
 *      defaults.json/sample.json parse as JSON
 *   2. Compiles with defaults.json ALONE — proves every field the template
 *      dereferences is covered by a default, i.e. it can never fail on
 *      missing data
 *   3. Compiles with sample.json (if present) merged over defaults
 *   4. No "unknown font family" warnings — compiles run through the server's
 *      own render function (--ignore-system-fonts + the server fonts/ folder
 *      + the bundle itself), so a bundle that passes here cannot hit missing
 *      fonts in production
 *
 * Output PDFs are written to __typst_cache/_validation/<bundle name>/ for
 * visual review. Exits non-zero on any failure, so this can run in CI.
 */

import path from 'path'
import fs from 'fs'
import os from 'os'
import archiver from 'archiver'
import StreamZip from 'node-stream-zip'
import { nanoid } from 'nanoid'
import { renderTypstPDF } from '../src/components/files/documentGenerateTypst'
import { TYPST_CACHE_FOLDER } from '../src/constants'
import { errorMessage } from '../src/components/utilityFunctions'

const VALIDATION_OUTPUT_FOLDER = path.join(TYPST_CACHE_FOLDER, '_validation')

// Relative path for concise display, but absolute when outside the cwd
const displayPath = (fullPath: string) => {
  const relative = path.relative(process.cwd(), fullPath)
  return relative.startsWith('..') ? fullPath : relative
}
const MAIN_TEMPLATE_NAME = 'main.typ'
const DEFAULTS_NAME = 'defaults.json'
const SAMPLE_NAME = 'sample.json'

interface Result {
  name: string
  problems: string[]
}

const main = async () => {
  const inputs = process.argv.slice(2)
  if (inputs.length === 0) {
    console.log('Usage: yarn validateTypst <path> [<path> ...]')
    console.log('  <path>: a .typzip bundle, an unpacked bundle folder (containing main.typ),')
    console.log('          a bare .typ template, or a folder of any of the above')
    process.exit(1)
  }

  const bundlePaths: string[] = []
  for (const input of inputs) {
    const fullPath = path.resolve(input)
    if (!fs.existsSync(fullPath)) {
      console.log(`ERROR: No such file or folder: ${input}`)
      process.exit(1)
    }
    if (!fs.statSync(fullPath).isDirectory()) {
      bundlePaths.push(fullPath)
      continue
    }
    if (fs.existsSync(path.join(fullPath, MAIN_TEMPLATE_NAME))) {
      bundlePaths.push(fullPath)
      continue
    }
    // A folder of bundles -- collect them (one level deep)
    for (const entry of fs.readdirSync(fullPath)) {
      const entryPath = path.join(fullPath, entry)
      if (/\.(typzip|typ)$/.test(entry)) bundlePaths.push(entryPath)
      else if (
        fs.statSync(entryPath).isDirectory() &&
        fs.existsSync(path.join(entryPath, MAIN_TEMPLATE_NAME))
      )
        bundlePaths.push(entryPath)
    }
  }

  if (bundlePaths.length === 0) {
    console.log('ERROR: No template bundles found in the supplied path(s)')
    process.exit(1)
  }

  const results: Result[] = []
  for (const bundlePath of bundlePaths) results.push(await validateBundle(bundlePath))

  const failed = results.filter(({ problems }) => problems.length > 0)
  console.log('\n=== Summary ===')
  for (const { name, problems } of results) {
    console.log(problems.length === 0 ? `PASS  ${name}` : `FAIL  ${name}`)
    for (const problem of problems) console.log(`        - ${problem}`)
  }
  console.log(`${results.length - failed.length} passed, ${failed.length} failed`)
  process.exit(failed.length > 0 ? 1 : 0)
}

const validateBundle = async (bundlePath: string): Promise<Result> => {
  const name = path.basename(bundlePath).replace(/\.(typzip|typ)$/, '')
  const problems: string[] = []
  console.log(`\n=== Validating ${path.basename(bundlePath)} ===`)

  const isFolder = fs.statSync(bundlePath).isDirectory()
  const isBareTyp = !isFolder && bundlePath.endsWith('.typ')

  // The path handed to renderTypstPDF -- unpacked folders get zipped to a
  // temp .typzip first, so validation always runs on a real bundle file
  let typzipPath = bundlePath
  let tempFolder: string | null = null

  let defaults: unknown
  let sample: unknown

  try {
    if (isBareTyp) {
      console.log(`  (bare .typ template: no ${DEFAULTS_NAME} possible, validating with no data)`)
    } else if (isFolder) {
      ;({ defaults, sample } = readDataFilesFromFolder(bundlePath, problems))
      tempFolder = fs.mkdtempSync(path.join(os.tmpdir(), 'typzip_validate_'))
      typzipPath = path.join(tempFolder, `${name}.typzip`)
      await zipBundleFolder(bundlePath, typzipPath)
    } else {
      ;({ defaults, sample } = await readDataFilesFromZip(bundlePath, problems))
    }
  } catch (err) {
    problems.push(errorMessage(err))
  }

  if (problems.length > 0) {
    // Structural problems -- compiling would just fail confusingly
    if (tempFolder) fs.rmSync(tempFolder, { recursive: true, force: true })
    return { name, problems }
  }

  const outputFolder = path.join(VALIDATION_OUTPUT_FOLDER, name)
  fs.mkdirSync(outputFolder, { recursive: true })

  const compile = async (label: string, data: object, outputFilename: string) => {
    // Unique render id per run: the render cache is keyed by fileId and never
    // invalidated (uploaded files are immutable), but the bundle being
    // validated here is a local work-in-progress that changes between runs
    const fileId = `_VALIDATION_${nanoid(8)}`
    const outputFullPath = path.join(outputFolder, outputFilename)
    try {
      const { warnings } = await renderTypstPDF({
        fileId,
        templateFullPath: typzipPath,
        data,
        outputFullPath,
      })
      const unknownFonts = [...(warnings ?? '').matchAll(/unknown font family: (.*)/g)].map(
        (match) => match[1]
      )
      if (unknownFonts.length > 0)
        problems.push(
          `${label}: unknown font families: ${[...new Set(unknownFonts)].join(', ')} ` +
            `(not in the server fonts folder, the bundle, or the typst binary)`
        )
      else console.log(`  ✓ ${label} → ${displayPath(outputFullPath)}`)
    } catch (err) {
      problems.push(`${label}: ${errorMessage(err)}`)
    } finally {
      fs.rmSync(path.join(TYPST_CACHE_FOLDER, fileId), { recursive: true, force: true })
    }
  }

  // The critical check: compiling with nothing but the defaults must succeed.
  // (Passing defaults as the data is equivalent to merging nothing over them.)
  await compile('Compile with defaults alone', (defaults as object) ?? {}, 'defaults.pdf')
  if (sample !== undefined) await compile('Compile with sample data', sample as object, 'sample.pdf')

  // For unpacked-folder input, emit the uploadable bundle on success
  if (isFolder && problems.length === 0) {
    const readyZipPath = bundlePath.replace(/[/\\]+$/, '') + '.typzip'
    fs.copyFileSync(typzipPath, readyZipPath)
    console.log(`  ✓ Ready-to-upload bundle written: ${displayPath(readyZipPath)}`)
  }
  if (tempFolder) fs.rmSync(tempFolder, { recursive: true, force: true })

  return { name, problems }
}

const readDataFilesFromFolder = (bundleFolder: string, problems: string[]) => {
  let defaults: unknown
  let sample: unknown
  if (!fs.existsSync(path.join(bundleFolder, DEFAULTS_NAME)))
    problems.push(`${DEFAULTS_NAME} missing from bundle root`)
  else defaults = parseJson(fs.readFileSync(path.join(bundleFolder, DEFAULTS_NAME), 'utf8'), DEFAULTS_NAME, problems)
  if (fs.existsSync(path.join(bundleFolder, SAMPLE_NAME)))
    sample = parseJson(fs.readFileSync(path.join(bundleFolder, SAMPLE_NAME), 'utf8'), SAMPLE_NAME, problems)
  return { defaults, sample }
}

const readDataFilesFromZip = async (zipPath: string, problems: string[]) => {
  let defaults: unknown
  let sample: unknown
  const zip = new StreamZip.async({ file: zipPath })
  try {
    const entries = await zip.entries()
    if (!entries[MAIN_TEMPLATE_NAME]) problems.push(`${MAIN_TEMPLATE_NAME} missing from bundle root`)
    if (!entries[DEFAULTS_NAME]) problems.push(`${DEFAULTS_NAME} missing from bundle root`)
    else defaults = parseJson((await zip.entryData(DEFAULTS_NAME)).toString(), DEFAULTS_NAME, problems)
    if (entries[SAMPLE_NAME])
      sample = parseJson((await zip.entryData(SAMPLE_NAME)).toString(), SAMPLE_NAME, problems)
  } finally {
    await zip.close()
  }
  return { defaults, sample }
}

const parseJson = (raw: string, filename: string, problems: string[]): unknown => {
  try {
    return JSON.parse(raw)
  } catch (err) {
    problems.push(`${filename} is not valid JSON: ${errorMessage(err)}`)
    return undefined
  }
}

const zipBundleFolder = (sourceFolder: string, zipFilePath: string) =>
  new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(zipFilePath)
    const archive = archiver('zip')
    output.on('close', () => resolve())
    output.on('error', reject)
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(sourceFolder, false, (entry) =>
      entry.name === '.DS_Store' ? false : entry
    )
    archive.finalize()
  })

main().catch((err) => {
  console.error('ERROR:', errorMessage(err))
  process.exit(1)
})
