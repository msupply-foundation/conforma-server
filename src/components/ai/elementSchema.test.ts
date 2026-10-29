import { buildOutputSchema, splitSupported } from './elementSchema'
import { ExtractionElement } from './types'

const name: ExtractionElement = { code: 'name', pluginCode: 'shortText', title: 'Name' }
const colour: ExtractionElement = {
  code: 'colour',
  pluginCode: 'radioChoice',
  title: 'Colour',
  options: ['Red', 'Blue'],
}
const sites: ExtractionElement = {
  code: 'sites',
  pluginCode: 'listBuilder',
  title: 'Sites',
  fields: [{ code: 'address', pluginCode: 'longText', title: 'Address' }, colour],
}

describe('splitSupported', () => {
  test('skips unsupported plugins and choice elements without options', () => {
    const upload: ExtractionElement = { code: 'upload', pluginCode: 'fileUpload', title: 'File' }
    const noOptions: ExtractionElement = { code: 'empty', pluginCode: 'radioChoice', title: 'X' }
    const { supported, skipped } = splitSupported([name, upload, noOptions, colour])
    expect(supported.map(({ code }) => code)).toEqual(['name', 'colour'])
    expect(skipped).toEqual(['upload', 'empty'])
  })

  test('supports a list only if all its fields are supported', () => {
    const upload: ExtractionElement = { code: 'upload', pluginCode: 'fileUpload', title: 'File' }
    const withUpload = { ...sites, code: 'withUpload', fields: [...sites.fields!, upload] }
    const noFields = { ...sites, code: 'noFields', fields: undefined }
    const { supported, skipped } = splitSupported([sites, withUpload, noFields])
    expect(supported.map(({ code }) => code)).toEqual(['sites'])
    expect(skipped).toEqual(['withUpload', 'noFields'])
  })
})

describe('buildOutputSchema', () => {
  const schema = buildOutputSchema([name, colour]) as any
  const item = schema.properties.answers.items

  test('answers are an array of one fixed shape, with no extra properties', () => {
    expect(schema.required).toEqual(['answers'])
    expect(schema.additionalProperties).toBe(false)
    expect(item.required).toEqual(['code', 'evidence', 'text', 'selectedOptions', 'confidence'])
    expect(item.additionalProperties).toBe(false)
  })

  test('codes are limited to the questions asked', () => {
    expect(item.properties.code.enum).toEqual(['name', 'colour'])
  })

  test("doesn't grow with the options", () => {
    const manyOptions = { ...colour, options: Array.from({ length: 50 }, (_, i) => `Option ${i}`) }
    expect(JSON.stringify(buildOutputSchema([name, manyOptions]))).toEqual(JSON.stringify(schema))
  })

  test('has rows, limited to the fields asked, only when there are lists', () => {
    expect(item.properties.rows).toBeUndefined()
    const listItem = (buildOutputSchema([name, sites]) as any).properties.answers.items
    expect(listItem.required).toContain('rows')
    expect(listItem.properties.rows.items.items.properties.code.enum).toEqual(['address', 'colour'])
  })

  test('rejects duplicate codes', () => {
    expect(() => buildOutputSchema([name, name])).toThrow('Duplicate element codes: name')
  })
})
