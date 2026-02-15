import fsx from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
import {
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_FOLDER,
  ZIP_CACHE_FOLDER,
} from '../../constants'
import { SnapshotInfo } from '../exportAndImport/types'
import { ArchiveData } from '../files/archive'
import { getHash } from '../template-import-export'
import { getTimeString } from './takeSnapshot'

type ZipItem = { name: string; size: number; outputPath: string }

interface GetZippedSnapshotOptions {
  snapshotName: string
  includeSnapshot: boolean
  archiveRange?: { from?: number; to?: number } | null
  zlibCompression?: number
}

export const getZippedSnapshot = async ({
  snapshotName,
  includeSnapshot,
  archiveRange = null,
  zlibCompression = 6,
}: GetZippedSnapshotOptions): Promise<string> => {
  console.log(`Getting zipped snapshot for ${snapshotName}...`)

  // Get snapshot folder path
  const snapshotFolder = path.join(SNAPSHOT_FOLDER, snapshotName)

  if (!fsx.existsSync(snapshotFolder)) throw new Error('Snapshot missing: ' + snapshotName)

  let info: SnapshotInfo
  try {
    info = await fsx.readJSON(path.join(snapshotFolder, `${INFO_FILE_NAME}.json`))
  } catch {
    throw new Error('Snapshot info file missing: ' + snapshotName)
  }

  let archive: ArchiveData | null = null
  try {
    archive = await fsx.readJSON(path.join(snapshotFolder, `archive.json`))
  } catch {
    // No archive available
  }

  // Create hash of name/timestamp/include/range
  const hash = getHash({
    name: snapshotName,
    includeSnapshot,
    archiveRange,
  })

  const zipFileName = `${snapshotName}_${hash}.zip`
  const zipFilePath = path.join(ZIP_CACHE_FOLDER, zipFileName)

  // Check if zip file already exists for this snapshot (based on hash) If it
  // does, return the path to the existing zip file (and update file accessed
  // date)
  if (await fsx.exists(zipFilePath)) {
    console.log('Zip file already exists for this snapshot, returning existing file...')
    const stats = await fsx.stat(zipFilePath)
    await fsx.utimes(zipFilePath, new Date(), stats.mtime)

    return zipFileName
  }

  // Collect list of files/folders to include in zip based on snapshot info and
  // archive range
  const filesToInclude: ZipItem[] = []

  if (includeSnapshot)
    filesToInclude.push({
      name: snapshotFolder,
      size: (await fsx.stat(snapshotFolder)).size,
      outputPath: '',
    })

  if (archiveRange && archive) {
    const { from = 0, to = Infinity } = archiveRange
    for (const arch of archive.history) {
      if (arch.timestamp >= from && arch.timestamp <= to) {
        filesToInclude.push({
          name: path.join(SNAPSHOT_ARCHIVE_FOLDER, arch.archiveFolder),
          size: arch.totalFileSize ?? 0,
          outputPath: path.join('archives/', arch.archiveFolder),
        })
      }
    }
  }

  const totalFileSize = filesToInclude.reduce((sum, { size }) => sum + size, 0)
  console.log(`Total file size to include in zip: ${totalFileSize}`)

  // TO-DO: Check there is enough disk space to create zip file (2x size of
  // files to include). If not run cleanup to free up space

  await zipSnapshot({
    sources: filesToInclude,
    zipName: `${snapshotName}_${hash}`,
    zlibCompression,
  })

  return zipFileName
}

interface ZipSnapshotOptions {
  sources: ZipItem[]
  zipName: string
  destination?: string
  zlibCompression?: number // 0-9
}

export const zipSnapshot = async ({
  sources,
  zipName,
  destination = ZIP_CACHE_FOLDER,
  zlibCompression = 6,
}: ZipSnapshotOptions) => {
  console.log('Zipping snapshot...')
  const zipStartTime = Date.now()
  const output = fsx.createWriteStream(path.join(destination, `${zipName}.zip`))
  const archive = archiver('zip', { zlib: { level: zlibCompression } })

  await archive.pipe(output)
  for (const { name, outputPath } of sources) {
    await archive.directory(name, outputPath)
  }
  await archive.finalize()
  console.log(`Zipping snapshot...done in ${getTimeString(zipStartTime)}`)
}
