// Renders the fictional medicine registration documents in sources/ to
// documents/: typed PDFs, a scanned certificate, a photo of the carton and a
// scanned letter. Uses a local Chrome (headless) and sharp from the server's
// dependencies.
//
//   node ai-extraction-tests/medicine-registration/generate.mjs
//
// Set CHROME to Chrome's executable if it isn't in the default macOS location.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import sharp from 'sharp'

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const folder = path.dirname(fileURLToPath(import.meta.url))
const sources = path.join(folder, 'sources')
const output = path.join(folder, 'documents')
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'medicine-registration-'))

const chrome = (args) =>
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', ...args], {
    stdio: 'ignore',
  })

const printPdf = (htmlFile, pdfFile) =>
  chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdfFile}`, pathToFileURL(htmlFile).href])

const screenshot = (htmlFile, pngFile, [width, height]) =>
  chrome([
    `--window-size=${width},${height}`,
    '--force-device-scale-factor=1',
    `--screenshot=${pngFile}`,
    pathToFileURL(htmlFile).href,
  ])

// Seeded, so regenerating gives the same files
const random = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const addNoise = async (image, amount, seed) => {
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  const next = random(seed)
  const noise = Buffer.alloc(info.width * info.height)
  for (let i = 0; i < noise.length; i++) noise[i] = 128 + Math.round((next() - 0.5) * 2 * amount)
  const grey = await sharp(noise, { raw: { width: info.width, height: info.height, channels: 1 } })
    .toColourspace('srgb')
    .png()
    .toBuffer()
  return sharp(data, { raw: info }).composite([{ input: grey, blend: 'overlay' }])
}

// A flatbed scan: slightly rotated on the scanner's grey lid, softened, noisy
// and compressed
const scan = async (pngFile, { angle, greyscale, seed }) => {
  let image = sharp(pngFile)
    .rotate(angle, { background: '#cfcfca' })
    .blur(0.7)
    .modulate({ brightness: 0.97, saturation: 0.75 })
  if (greyscale) image = image.greyscale()
  image = await addNoise(sharp(await image.png().toBuffer()), 14, seed)
  return image.jpeg({ quality: 70 }).toBuffer()
}

// A phone photo: soft focus, sensor noise, compressed
const photo = async (pngFile, seed) => {
  const image = sharp(pngFile).blur(0.9).modulate({ brightness: 1.03, saturation: 0.9 })
  const noisy = await addNoise(sharp(await image.png().toBuffer()), 10, seed)
  return noisy.jpeg({ quality: 78 }).toBuffer()
}

// Wraps a scanned page in a one-page A4 PDF, as a scanner would
const imagePdf = (jpeg, pdfFile) => {
  const html = path.join(scratch, 'image.html')
  fs.writeFileSync(
    html,
    `<!doctype html><style>@page { size: A4; margin: 0 } html, body { margin: 0 }
    img { width: 210mm; height: 297mm; object-fit: contain; display: block }</style>
    <img src="data:image/jpeg;base64,${jpeg.toString('base64')}">`
  )
  printPdf(html, pdfFile)
}

const source = (name) => path.join(sources, name)
const target = (name) => path.join(output, name)

fs.mkdirSync(output, { recursive: true })

printPdf(source('1-cpp.html'), target('1-cpp.pdf'))
printPdf(source('2-smpc.html'), target('2-smpc.pdf'))

screenshot(source('3-gmp-certificate.html'), path.join(scratch, 'gmp.png'), [1000, 1414])
fs.writeFileSync(
  target('3-gmp-certificate.jpg'),
  await scan(path.join(scratch, 'gmp.png'), { angle: 1.4, greyscale: false, seed: 3 })
)

screenshot(source('4-carton.html'), path.join(scratch, 'carton.png'), [1600, 1200])
fs.writeFileSync(target('4-carton.jpg'), await photo(path.join(scratch, 'carton.png'), 4))

screenshot(source('5-authorisation-letter.html'), path.join(scratch, 'letter.png'), [1000, 1414])
imagePdf(
  await scan(path.join(scratch, 'letter.png'), { angle: -0.8, greyscale: true, seed: 5 }),
  target('5-authorisation-letter.pdf')
)

fs.rmSync(scratch, { recursive: true })
for (const file of fs.readdirSync(output))
  console.log(`${file}  ${(fs.statSync(target(file)).size / 1024).toFixed(0)} KB`)
