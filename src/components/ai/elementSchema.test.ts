import { buildOutputSchema, splitSupported } from './elementSchema'
import { PrefillElement } from './types'

const name: PrefillElement = { code: 'name', pluginCode: 'shortText', title: 'Name' }
const colour: PrefillElement = {
  code: 'colour',
  pluginCode: 'radioChoice',
  title: 'Colour',
  options: ['Red', 'Blue'],
}

describe('splitSupported', () => {
  test('skips unsupported plugins and choice elements without options', () => {
    const upload: PrefillElement = { code: 'upload', pluginCode: 'fileUpload', title: 'File' }
    const noOptions: PrefillElement = { code: 'empty', pluginCode: 'radioChoice', title: 'X' }
    const { supported, skipped } = splitSupported([name, upload, noOptions, colour])
    expect(supported.map(({ code }) => code)).toEqual(['name', 'colour'])
    expect(skipped).toEqual(['upload', 'empty'])
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

  test('rejects duplicate codes', () => {
    expect(() => buildOutputSchema([name, name])).toThrow('Duplicate element codes: name')
  })
})
