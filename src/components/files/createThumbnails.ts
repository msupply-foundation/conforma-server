const genericThumbnailPaths: { [key: string]: string } = {
  image: 'generic_image_file.png',
  audio: 'generic_audio_file.png',
  video: 'generic_video_file.png',
  pdf: 'generic_pdf_file.png',
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

const createThumbnail = async ({
  filesPath,
  unique_id,
  basename,
  ext,
  mimetype,
}: ThumbnailInput) => {
  const { type, subtype } = splitMimetype(mimetype)

  const oldFilePath = path.join(filesPath, `${basename}_${unique_id}${ext}`)
  const newFilePath = path.join(filesPath, `${basename}_${unique_id}_thumb`) // No ext

  if (type === 'image') {
    try {
      const { format } = await sharp(oldFilePath)
        .resize(thumbnailMaxWidth, thumbnailMaxHeight)
        .toFile(newFilePath)
      await fs.rename(newFilePath, `${newFilePath}.${format}`, _)
      return `${basename}_${unique_id}_thumb.${format}`
    } catch {
      return getGenericThumbnailPath(type)
    }
  } else if (mimetype === 'application/pdf') {
    // TO-DO: Find a PDF conversion library
  } else {
    return getGenericThumbnailPath(type)
  }
  return 'This is the new path'
}

const splitMimetype = (mimetype: string) => {
  // To-do: parse correctly if mimetype has parameter
  // (e.g. type/subtype;parameter=value)
  const [type, subtype] = mimetype.split('/')
  return { type, subtype }
}

const getGenericThumbnailPath = (type: string) => {
  if (type in genericThumbnailPaths) return genericThumbnailPaths[type]
  else return 'extremely_generic_file_image.png'
}

export default createThumbnail
