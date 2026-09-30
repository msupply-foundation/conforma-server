/**
 * Content-Disposition header for files served by the public /file endpoint.
 *
 * PDFs and common image types are sent "inline", so opening one in a new tab
 * shows it in the browser's own viewer rather than downloading it. The
 * web-app's download buttons still download, because they set the link's
 * `download` attribute, which takes precedence over "inline".
 *
 * Everything else is sent as an "attachment". The endpoint is served from the
 * same origin as the web-app, so an uploaded HTML or SVG file displayed inline
 * could run scripts with the viewer's session. Keep SVG, HTML and any other
 * script-capable type out of this list. The route also sends
 * `X-Content-Type-Options: nosniff`, so the browser trusts the Content-Type
 * rather than treating a mislabelled file as a web page.
 */
const INLINE_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']

const isInlineMimeType = (mimeType: string) =>
  INLINE_MIME_TYPES.includes((mimeType).split(';')[0].trim().toLowerCase())

export const getFileContentDisposition = (
  mimeType: string,
  filename: string
) => {
  const disposition = isInlineMimeType(mimeType) ? 'inline' : 'attachment'
  return `${disposition}; filename="${encodeURIComponent(
    filename
  )}"; filename*=UTF-8''${encodeURIComponent(filename)}`
}
