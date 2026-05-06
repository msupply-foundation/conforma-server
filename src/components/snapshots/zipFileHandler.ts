import fsx from 'fs-extra'
import path from 'path'
import archiver from 'archiver'
import { execFile } from 'child_process'
import { promisify } from 'util'
import {
  INFO_FILE_NAME,
  SNAPSHOT_ARCHIVE_FOLDER,
  SNAPSHOT_ARCHIVES_FOLDER_NAME,
  SNAPSHOT_FOLDER,
  ZIP_CACHE_FOLDER,
} from '../../constants'
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

const getReadableBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  const rounded = value >= 100 ? value.toFixed(0) : value.toFixed(1)
  return `${rounded}${units[exponent]}`
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

  try {
    await fsx.readJSON(path.join(snapshotFolder, `${INFO_FILE_NAME}.json`))
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
          outputPath: path.join(SNAPSHOT_ARCHIVES_FOLDER_NAME, arch.archiveFolder),
        })
      }
    }
  }

  const totalFileSize = filesToInclude.reduce((sum, { size }) => sum + size, 0)
  console.log(
    `Total file size to include in zip: ${getReadableBytes(totalFileSize)} (${totalFileSize} bytes)`
  )

  // TO-DO: Check there is enough disk space to create zip file (size of files
  // to include + a bit of headroom). If not run cleanup to free up space

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

type ZipCachePruneResult = string[] | false

/**
 * Ensures that at least `requiredSpace` bytes are available on the disk where
 * `ZIP_CACHE_FOLDER` is located. If needed, deletes files from
 * `ZIP_CACHE_FOLDER` in descending size order until enough space is available.
 *
 * Returns:
 * - list of deleted file names when required space is met
 * - `false` if all files are deleted and required space is still unavailable
 */
export const pruneZipCacheForRequiredSpace = async (
  requiredSpace: number
): Promise<ZipCachePruneResult> => {
  try {
    console.log(
      `Pruning zip cache to free up space if needed. Required space: ${getReadableBytes(requiredSpace)} (${requiredSpace} bytes)`
    )

    const getAvailableBytes = async (): Promise<number> => {
      const execFileAsync = promisify(execFile)

      // Prefer `df` for consistency with OS reporting and clearer behaviour on
      // macOS/APFS. `-kP` returns POSIX layout with sizes in KiB.
      try {
        const { stdout } = await execFileAsync('df', ['-kP', ZIP_CACHE_FOLDER])
        const lines = stdout.trim().split(/\r?\n/)
        if (lines.length >= 2) {
          const columns = lines[1].trim().split(/\s+/)
          const availableKiB = Number(columns[3])
          if (Number.isFinite(availableKiB)) return availableKiB * 1024
        }
      } catch {
        // Fall back to statfs below
      }

      const statfsFn = (fsx as any).statfs
      if (typeof statfsFn !== 'function')
        throw new Error('Unable to determine disk free space (df/statfs unavailable)')

      const statfsAsync = promisify(statfsFn).bind(fsx)
      const statfs = await statfsAsync(ZIP_CACHE_FOLDER)
      const blockSize = Number(statfs.bsize ?? 1)
      const availableBlocks = Number(statfs.bavail ?? statfs.bfree ?? 0)
      return blockSize * availableBlocks
    }

    const deletedFiles: string[] = []
    let available = await getAvailableBytes()
    if (available >= requiredSpace) {
      console.log(`${getReadableBytes(available)} available, no need to prune zip cache`)
      return deletedFiles
    }

    const entries = await fsx.readdir(ZIP_CACHE_FOLDER)
    const files = await Promise.all(
      entries.map(async (fileName) => {
        const filePath = path.join(ZIP_CACHE_FOLDER, fileName)
        const stats = await fsx.stat(filePath)
        return stats.isFile() ? { fileName, filePath, size: stats.size } : null
      })
    )

    const filesByLargestFirst = files
      .filter((file): file is { fileName: string; filePath: string; size: number } => !!file)
      .sort((a, b) => b.size - a.size)

    for (const file of filesByLargestFirst) {
      await fsx.remove(file.filePath)
      deletedFiles.push(file.fileName)

      available = await getAvailableBytes()
      if (available >= requiredSpace) {
        console.log('Pruned zip cache: ', deletedFiles)
        return deletedFiles
      }
    }

    console.log(
      `WARNING: Not enough space available after pruning zip cache, even after deleting all files. Available space: ${getReadableBytes(available)} (${available} bytes)`
    )
    return false
  } catch (error) {
    console.log('ERROR pruning zip cache:', error)
    return false
  }
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
    console.log('Archiving:', name)
    await archive.directory(name, outputPath)
  }
  await archive.finalize()
  console.log(`Zipping snapshot...done in ${getTimeString(zipStartTime)}`)
}
