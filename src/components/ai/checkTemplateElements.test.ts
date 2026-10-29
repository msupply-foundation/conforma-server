import { TemplateElementRow, validateTemplateElements } from './checkTemplateElements'
import { ExtractionElement } from './types'

const templateElements: TemplateElementRow[] = [
  { code: 'intro', pluginCode: 'textInfo', category: 'INFORMATION' },
  { code: 'fill', pluginCode: 'aiDocumentFill', category: 'QUESTION' },
  { code: 'name', pluginCode: 'shortText', category: 'QUESTION' },
  { code: 'colour', pluginCode: 'radioChoice', category: 'QUESTION' },
  {
    code: 'sites',
    pluginCode: 'listBuilder',
    category: 'QUESTION',
    inputFields: [{ code: 'address', elementTypePluginCode: 'longText' }],
  },
]

const name: ExtractionElement = { code: 'name', pluginCode: 'shortText', title: 'Name' }
const colour: ExtractionElement = {
  code: 'colour',
  pluginCode: 'radioChoice',
  title: 'Colour',
  options: ['Red', 'Blue'],
}

const statusOf = (run: () => void) => {
  try {
    run()
  } catch (err) {
    return (err as { status?: number }).status
  }
}

describe('validateTemplateElements', () => {
  test('accepts the template’s questions', () => {
    expect(() => validateTemplateElements(templateElements, [name, colour])).not.toThrow()
  })

  test('rejects a template without the aiDocumentFill element', () => {
    const withoutFill = templateElements.filter(({ code }) => code !== 'fill')
    expect(statusOf(() => validateTemplateElements(withoutFill, [name]))).toBe(404)
  })

  test('rejects a code that isn’t in the template', () => {
    const other: ExtractionElement = { code: 'other', pluginCode: 'shortText', title: 'Other' }
    expect(() => validateTemplateElements(templateElements, [name, other])).toThrow(/other/)
    expect(statusOf(() => validateTemplateElements(templateElements, [other]))).toBe(400)
  })

  test('rejects a code sent with a different plugin', () => {
    const disguised: ExtractionElement = { ...colour, pluginCode: 'shortText' }
    expect(statusOf(() => validateTemplateElements(templateElements, [disguised]))).toBe(400)
  })

  test("checks a list's fields against its inputFields", () => {
    const list = (fields: ExtractionElement[]): ExtractionElement => ({
      code: 'sites',
      pluginCode: 'listBuilder',
      title: 'Sites',
      fields,
    })
    const address = { code: 'address', pluginCode: 'longText', title: 'Address' }
    expect(() => validateTemplateElements(templateElements, [list([address])])).not.toThrow()
    const disguised = { ...address, pluginCode: 'shortText' }
    expect(() => validateTemplateElements(templateElements, [list([disguised])])).toThrow(
      /sites\.address/
    )
    const other = { code: 'other', pluginCode: 'longText', title: 'Other' }
    expect(statusOf(() => validateTemplateElements(templateElements, [list([other])]))).toBe(400)
  })

  test('rejects an element that isn’t a question', () => {
    const intro: ExtractionElement = { code: 'intro', pluginCode: 'textInfo', title: 'Intro' }
    expect(statusOf(() => validateTemplateElements(templateElements, [intro]))).toBe(400)
  })
})
