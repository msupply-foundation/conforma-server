import { getFileContentDisposition } from './contentDisposition'

// getFileContentDisposition decides whether the /file endpoint lets the
// browser display a file in a tab ("inline") or forces a download
// ("attachment"). Only types that can't run scripts may be inline, since the
// endpoint shares the web-app's origin.

const dispositionOf = (mimeType: string) =>
  getFileContentDisposition(mimeType, 'file.x').split(';')[0]

test('PDFs and common image types open inline', () => {
  for (const mimeType of ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'])
    expect(dispositionOf(mimeType)).toBe('inline')
})

test('script-capable and other types download', () => {
  for (const mimeType of [
    'text/html',
    'image/svg+xml',
    'application/xhtml+xml',
    'text/xml',
    'application/zip',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ])
    expect(dispositionOf(mimeType)).toBe('attachment')
})

test('an empty mimetype downloads', () => {
  expect(dispositionOf('')).toBe('attachment')
})

test('mimetype case and parameters are ignored', () => {
  expect(dispositionOf('Application/PDF; charset=binary')).toBe('inline')
})

test('filename is included in plain and UTF-8 forms', () => {
  expect(getFileContentDisposition('application/pdf', 'Licence Ā.pdf')).toBe(
    `inline; filename="Licence%20%C4%80.pdf"; filename*=UTF-8''Licence%20%C4%80.pdf`
  )
})
