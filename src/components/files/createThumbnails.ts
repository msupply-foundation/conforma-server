import config from '../../config'
import path from 'path'
import sharp from 'sharp'
const { thumbnailMaxWidth, thumbnailMaxHeight } = config
const { genericThumbnailsFolderName } = config

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

interface ThumbnailInput {
  filesPath: string
  unique_id: string
  basename: string
  ext: string
  subfolder: string
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
  subfolder,
  mimetype,
}: ThumbnailInput) => {
  const { type, subtype } = splitMimetype(mimetype)

  const fullFilePath = path.join(filesPath, subfolder, `${basename}_${unique_id}${ext}`)
  const thumbnailFilePath = path.join(filesPath, subfolder, `${basename}_${unique_id}_thumb`) // No ext, added after conversion -- could be different

  if (type === 'image') {
    try {
      await sharp(fullFilePath)
        .resize(thumbnailMaxWidth, thumbnailMaxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .toFile(thumbnailFilePath + '.jpg')
      return path.join(subfolder, `${basename}_${unique_id}_thumb.jpg`)
    } catch {
      console.log('Problem converting image file, reverting to generic fallback')
      return getGenericThumbnailPath(type)
    }
  } else if (mimetype === 'application/pdf') {
    // TO-DO Generate PDF previews/thumbnails
    return getGenericThumbnailPath('pdf')
  } else if (['.pdf', '.doc', '.docx'].includes(ext))
    return getGenericThumbnailPath(ext.replace('.', ''))
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
  const filename =
    genericThumbnails?.[subtype] || genericThumbnails?.[type] || genericThumbnails.file
  return path.join(genericThumbnailsFolderName, filename)
}

export default createThumbnail
