import { buildOutputFilenames } from './outputFilename'

// buildOutputFilenames decides both the user-facing download name
// (original_filename) and the on-disk name (file_path) of a generated PDF.
// The download name must never include the uniqueId, since that ID alone is
// enough to download the file. The on-disk name must always include it, for
// uniqueness.

const uniqueId = 'AbC123xyz'

test('default with serial: <template>_<serial>.pdf, on-disk name adds the uniqueId', () => {
  expect(
    buildOutputFilenames({ templateName: 'Licence', applicationSerial: 'S-123', uniqueId })
  ).toEqual({
    originalFilename: 'Licence_S-123.pdf',
    outputFilename: 'Licence_S-123_AbC123xyz.pdf',
  })
})

test('default without serial never puts the uniqueId in the download name', () => {
  const { originalFilename, outputFilename } = buildOutputFilenames({
    templateName: 'Licence',
    uniqueId,
  })
  expect(originalFilename).toBe('Licence.pdf')
  expect(originalFilename).not.toContain(uniqueId)
  expect(outputFilename).toBe('Licence_AbC123xyz.pdf')
})

test('custom filename is used for both names, with .pdf appended', () => {
  expect(
    buildOutputFilenames({
      filename: 'Import Licence 2026',
      templateName: 'Licence',
      applicationSerial: 'S-123',
      uniqueId,
    })
  ).toEqual({
    originalFilename: 'Import Licence 2026.pdf',
    outputFilename: 'Import Licence 2026_AbC123xyz.pdf',
  })
})

test('an existing .pdf / .PDF extension is not doubled', () => {
  expect(
    buildOutputFilenames({ filename: 'Report.pdf', templateName: 'T', uniqueId }).originalFilename
  ).toBe('Report.pdf')
  expect(
    buildOutputFilenames({ filename: 'Report.PDF', templateName: 'T', uniqueId }).originalFilename
  ).toBe('Report.pdf')
  expect(
    buildOutputFilenames({ filename: 'Report.PDF', templateName: 'T', uniqueId }).outputFilename
  ).toBe('Report_AbC123xyz.pdf')
})

test('other extensions are kept and .pdf is still appended', () => {
  expect(
    buildOutputFilenames({ filename: 'Report v1.2', templateName: 'T', uniqueId }).originalFilename
  ).toBe('Report v1.2.pdf')
})

test('path separators and traversal collapse into a single safe segment', () => {
  const traversal = buildOutputFilenames({
    filename: '../../etc/passwd',
    templateName: 'T',
    uniqueId,
  })
  expect(traversal.originalFilename).toBe('etc_passwd.pdf')
  expect(traversal.outputFilename).toBe('etc_passwd_AbC123xyz.pdf')

  const mixed = buildOutputFilenames({ filename: 'a/b\\c', templateName: 'T', uniqueId })
  expect(mixed.originalFilename).toBe('a_b_c.pdf')
  expect(mixed.outputFilename).not.toMatch(/[\\/]/)
})

test('control and Windows-reserved characters are removed, spaces are kept', () => {
  const { originalFilename } = buildOutputFilenames({
    filename: 'Bad:name<x>|y?z*"q\u0000\r\n  with   spaces',
    templateName: 'T',
    uniqueId,
  })
  expect(originalFilename).not.toMatch(/[<>:"|?*\x00-\x1f]/)
  expect(originalFilename).toMatch(/^Bad_name/)
  expect(originalFilename).toBe('Bad_name_x__y_z__q with spaces.pdf')
})

test('non-string or blank filename falls back to the default', () => {
  const expected = { originalFilename: 'T_S-1.pdf', outputFilename: 'T_S-1_AbC123xyz.pdf' }
  const common = { templateName: 'T', applicationSerial: 'S-1', uniqueId }
  expect(buildOutputFilenames({ ...common, filename: undefined })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: null })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: 42 })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: { a: 1 } })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: '' })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: '   ' })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: '.pdf' })).toEqual(expected)
  expect(buildOutputFilenames({ ...common, filename: '../..' })).toEqual(expected)
})

test('with nothing usable at all, a generic "document" name is used', () => {
  expect(buildOutputFilenames({ templateName: '', uniqueId })).toEqual({
    originalFilename: 'document.pdf',
    outputFilename: 'document_AbC123xyz.pdf',
  })
})

test('base name is capped in length; the uniqueId suffix survives intact', () => {
  const { originalFilename, outputFilename } = buildOutputFilenames({
    filename: 'x'.repeat(200),
    templateName: 'T',
    uniqueId,
  })
  expect(originalFilename).toBe('x'.repeat(80) + '.pdf')
  expect(outputFilename).toBe('x'.repeat(80) + '_AbC123xyz.pdf')
})
