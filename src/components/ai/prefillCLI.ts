import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { Client } from 'pg'
import { extractAnswers } from './extractAnswers'
import { isChoiceElement } from './elementSchema'
import { PrefillEffort, PrefillElement, PrefillMediaType, PrefillResult } from './types'

/*
Tries AI document prefill without the web-app. See DOCUMENT_PREFILL_SPEC.md.

  yarn ai_prefill elements <templateCode> [--out <file>]
      Writes the template's questions as element definitions (the JSON the
      web-app will send). Parameters that are fig-tree expressions can't be
      evaluated here: dynamic labels fall back to the element title, and
      choice elements with dynamic options are left out. Edit the file to
      fill those in or to remove questions.

  yarn ai_prefill run <document>... --elements <file> [options]
      Sends the documents and questions to the model and prints the answers.

Options for "run":
  --model <id>           default claude-opus-5-5
  --effort <level>       low | medium (default) | high | xhigh | max
  --instructions <text>  extra guidance, as a template designer would give
  --out <file>           also write the full result as JSON
*/

const OUTPUT_FOLDER = 'ai-prefill-tests'

// USD per million tokens [input, output], standard API rates. Only used for
// the cost estimate printed after a run.
const PRICES: Record<string, [number, number]> = {
  'claude-opus-5-5': [4, 20],
  'claude-sonnet-5-5': [2, 10],
  'claude-haiku-5-5': [0.1, 0.5],
}

const MEDIA_TYPES: Record<string, PrefillMediaType> = {
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

const usage = () => {
  console.log(`
  yarn ai_prefill elements <templateCode> [--out <file>]
  yarn ai_prefill run <document>... --elements <file> [--model <id>]
      [--effort <level>] [--instructions <text>] [--out <file>]
`)
  process.exit(1)
}

const OPTIONS_WITH_VALUES = ['out', 'elements', 'model', 'effort', 'instructions']

const getOption = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)
  if (index < 0) return undefined
  const value = process.argv[index + 1]
  if (!value || value.startsWith('--')) {
    console.log(`ERROR: --${name} must be followed by a value`)
    usage()
  }
  return value
}

// Arguments after the command that aren't options or option values
const getPositionalArgs = () => {
  const args = process.argv.slice(3)
  return args.filter(
    (arg, index) =>
      !arg.startsWith('--') && !OPTIONS_WITH_VALUES.includes(args[index - 1]?.replace(/^--/, ''))
  )
}

const writeJson = (file: string, data: unknown) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`Written to ${file}`)
}

// --- elements ---

const isExpression = (value: unknown) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Static option lists only; returns undefined for anything dynamic
const getOptions = (parameters: Record<string, any>, pluginCode: string) => {
  const options = pluginCode === 'checkbox' ? parameters.checkboxes : parameters.options
  if (!Array.isArray(options)) return undefined

  const labels = options.map((option) => {
    if (typeof option === 'string') return option
    if (!isExpression(option)) return undefined
    if (pluginCode === 'checkbox') return option.label ?? option.text
    const displayProperty = parameters.optionsDisplayProperty
    return typeof displayProperty === 'string' ? option[displayProperty] : undefined
  })
  return labels.every((label) => typeof label === 'string') ? (labels as string[]) : undefined
}

// A plain client, not databaseConnect: that singleton starts the server's
// notification listener, which would process triggers and actions alongside
// a running server. The config is imported here, not at the top, so that
// "run" doesn't load it.
const queryTemplateElements = async (templateCode: string) => {
  const { default: config } = await import('../../config')
  const client = new Client(config.pg_database_connection)
  await client.connect()
  try {
    const { rows } = await client.query(
      `SELECT e.code, e.element_type_plugin_code AS "pluginCode", e.title,
        e.help_text AS "helpText", e.is_required AS "isRequired", e.parameters
      FROM template_element e
      JOIN template_section s ON s.id = e.section_id
      JOIN template t ON t.id = s.template_id
      WHERE t.code = $1 AND t.status = 'AVAILABLE' AND e.category = 'QUESTION'
      ORDER BY s.index, e.index`,
      [templateCode]
    )
    return rows
  } finally {
    await client.end()
  }
}

const buildElements = async (templateCode: string) => {
  const rows = await queryTemplateElements(templateCode)
  if (rows.length === 0) throw new Error(`No available template "${templateCode}" with questions`)

  const elements: PrefillElement[] = []
  const leftOut: string[] = []

  for (const row of rows) {
    const parameters = row.parameters ?? {}
    const label = typeof parameters.label === 'string' ? parameters.label : row.title || row.code
    const description =
      typeof parameters.description === 'string' ? parameters.description : undefined
    const helpText = [description, row.helpText].filter(Boolean).join('\n\n') || undefined

    const element: PrefillElement = {
      code: row.code,
      pluginCode: row.pluginCode,
      title: label,
      ...(helpText ? { helpText } : {}),
      ...(typeof row.isRequired === 'boolean' ? { isRequired: row.isRequired } : {}),
    }

    if (isChoiceElement(element)) {
      const options = getOptions(parameters, row.pluginCode)
      if (!options) {
        leftOut.push(`${row.code} (dynamic options)`)
        continue
      }
      element.options = options
      if (row.pluginCode === 'dropdownChoice' && parameters.multiSelect === true)
        element.multiSelect = true
    }
    elements.push(element)
  }

  return { elements, leftOut }
}

const runElements = async () => {
  const [templateCode] = getPositionalArgs()
  if (!templateCode) usage()

  const { elements, leftOut } = await buildElements(templateCode)
  writeJson(getOption('out') ?? path.join(OUTPUT_FOLDER, `${templateCode}.elements.json`), elements)
  console.log(`${elements.length} questions`)
  if (leftOut.length > 0) console.log(`Left out: ${leftOut.join(', ')}`)
}

// --- run ---

const truncate = (text: string, length: number) =>
  text.length > length ? text.slice(0, length - 1) + '…' : text

const printResult = (elements: PrefillElement[], result: PrefillResult) => {
  const { answers, skipped, usage } = result
  console.log('')
  for (const element of elements) {
    if (skipped.includes(element.code)) continue
    const answer = answers[element.code]
    if (!answer) {
      console.log(`  -  ${element.code}: not found`)
      continue
    }
    const value = Array.isArray(answer.value) ? answer.value.join('; ') : String(answer.value)
    console.log(
      `  ✓  ${element.code} (${answer.confidence.toFixed(2)}): ${truncate(value, 100)}`
    )
    if (answer.evidence) console.log(`       evidence: ${truncate(answer.evidence, 100)}`)
  }

  const answerable = elements.length - skipped.length
  console.log(`\nAnswered ${Object.keys(answers).length} of ${answerable} questions`)
  if (skipped.length > 0) console.log(`Not supported: ${skipped.join(', ')}`)

  const price = PRICES[usage.model]
  const cost = price
    ? ` ≈ $${((usage.inputTokens * price[0] + usage.outputTokens * price[1]) / 1e6).toFixed(3)}`
    : ''
  console.log(
    `${usage.model}: ${usage.inputTokens} input + ${usage.outputTokens} output tokens${cost}, ` +
      `${(usage.durationMs / 1000).toFixed(1)}s`
  )
}

const runExtraction = async () => {
  const files = getPositionalArgs()
  const elementsFile = getOption('elements')
  if (files.length === 0 || !elementsFile) usage()

  const documents = files.map((file) => {
    const mediaType = MEDIA_TYPES[path.extname(file).toLowerCase()]
    if (!mediaType) throw new Error(`Unsupported file type: ${file}`)
    return { name: path.basename(file), mediaType, data: fs.readFileSync(file) }
  })
  const elements: PrefillElement[] = JSON.parse(fs.readFileSync(elementsFile as string, 'utf8'))

  console.log(`Reading ${documents.length} document(s) for ${elements.length} questions...`)
  const result = await extractAnswers(documents, elements, {
    model: getOption('model'),
    effort: getOption('effort') as PrefillEffort | undefined,
    instructions: getOption('instructions'),
  })

  printResult(elements, result)
  const out = getOption('out')
  if (out) writeJson(out, result)
}

const commands: Record<string, () => Promise<void>> = {
  elements: runElements,
  run: runExtraction,
}

const command = commands[process.argv[2]]
if (!command) usage()

command()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(`ERROR: ${err instanceof Error ? err.message : err}`)
    process.exit(1)
  })
