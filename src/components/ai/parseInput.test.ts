import { detectMediaType, parseElements } from './parseInput'

describe('parseElements', () => {
  test('keeps only known fields', () => {
    const elements = parseElements(
      JSON.stringify([
        {
          code: 'colour',
          pluginCode: 'radioChoice',
          title: 'Colour',
          options: ['Red', 'Blue'],
          currentValue: 'Red',
          isRequired: true,
          multiSelect: false,
          parameters: { anything: 'else' },
        },
      ])
    )
    expect(elements).toEqual([
      {
        code: 'colour',
        pluginCode: 'radioChoice',
        title: 'Colour',
        options: ['Red', 'Blue'],
        currentValue: 'Red',
        isRequired: true,
      },
    ])
  })

  test.each([
    [undefined, 'Missing "elements"'],
    ['not json', 'not valid JSON'],
    ['[]', 'non-empty array'],
    ['[{"code": "x", "title": "X"}]', 'needs a string code, pluginCode and title'],
    ['[{"code": "x", "pluginCode": "radioChoice", "title": "X", "options": [1]}]', 'options'],
  ])('rejects %s', (json, message) => {
    expect(() => parseElements(json)).toThrow(message)
  })
})

describe('detectMediaType', () => {
  const bytes = (...values: number[]) => Buffer.from(values)

  test.each([
    ['PDF', Buffer.from('%PDF-1.7\n...'), 'application/pdf'],
    ['PDF after other bytes', Buffer.concat([Buffer.alloc(20), Buffer.from('%PDF-1.4')]), 'application/pdf'],
    ['JPEG', bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0), 'image/jpeg'],
    ['PNG', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0), 'image/png'],
    ['GIF', Buffer.from('GIF89a...'), 'image/gif'],
    ['WebP', Buffer.from('RIFF\0\0\0\0WEBPVP8 '), 'image/webp'],
  ])('recognises %s', (_label, data, mediaType) => {
    expect(detectMediaType(data)).toBe(mediaType)
  })

  test('rejects anything else, including HEIC', () => {
    expect(detectMediaType(Buffer.from('\0\0\0\x18ftypheic'))).toBeUndefined()
    expect(detectMediaType(Buffer.from('PK\x03\x04 a .docx file'))).toBeUndefined()
  })
})
