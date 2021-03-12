// Maps file types (mimetype or ext) to generic
// thumbnail files
const genericThumbnails: { [key: string]: string } = {
  image: 'noun_Image_1570203.png',
  doc: 'noun_word_3515287.png',
  docx: 'noun_word_3515287.png',
  pdf: 'noun_PDF_3283219.png',
  text: 'noun_word_3515287.png',
  msword: 'noun_word_3515287.png',
  file: 'noun_File_3764922.png',
}

import * as config from '../../config.json'
import path from 'path'
import fs from 'fs'
const sharp = require('sharp')
const { thumbnailMaxWidth, thumbnailMaxHeight } = config

interface ThumbnailInput {
  filesPath: string
  unique_id: string
  basename: string
  ext: string
  mimetype: string
}

// We use a combination of mimetype (type/subtype) and file extension to
// determine which conversion process to use, or which generic
// thumbnail to return
const createThumbnail = async ({
  filesPath,
  unique_id,
  basename,
  ext,
  mimetype,
}: ThumbnailInput) => {
  const { type, subtype } = splitMimetype(mimetype)

  const origFilePath = path.join(filesPath, `${basename}_${unique_id}${ext}`)
  const thumbnailFilePath = path.join(filesPath, `${basename}_${unique_id}_thumb`) // No ext, added after conversion

  if (type === 'image') {
    try {
      const { format } = await sharp(origFilePath)
        .resize(thumbnailMaxWidth, thumbnailMaxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(thumbnailFilePath)
      await fs.rename(thumbnailFilePath, `${thumbnailFilePath}.${format}`, () => {})
      return `${basename}_${unique_id}_thumb.${format}`
    } catch {
      return getGenericThumbnailPath(type)
    }
  } else if (mimetype === 'application/pdf') {
    // TO-DO Generate PDF previews/thumbnails
    return getGenericThumbnailPath('pdf')
  } else if (['.pdf', '.doc', '.docx'].includes(ext))
    return getGenericThumbnailPath(`_/${ext.replace('.', '')}`)
  else return getGenericThumbnailPath(mimetype)
}

const splitMimetype = (mimetype: string) => {
  // To-do: parse correctly if mimetype has parameter
  // (e.g. type/subtype;parameter=value)
  const [type, subtype] = mimetype.split('/')
  return { type, subtype }
}

const getGenericThumbnailPath = (mimetype: string) => {
  const { type, subtype } = splitMimetype(mimetype)
  if (subtype in genericThumbnails) return genericThumbnails[subtype]
  if (type in genericThumbnails) return genericThumbnails[type]
  return genericThumbnails.file
}

export default createThumbnail
