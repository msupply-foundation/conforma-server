import path from 'path'
import fsx from 'fs-extra'
import semverCompare from 'semver/functions/compare'
import { DataTable as PgDataTable } from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { filterModifiedData } from './getDiff'
import { FILES_FOLDER } from '../../constants'
import config from '../../config'
import { LinkedEntities, LinkedEntity, TemplateStructure } from './types'
import { replaceForeignKeyRef } from './updateHashes'

interface InfoFile {
  timestamp: string
  version: string
}

export type InstallDetails = Record<string, 'incoming' | 'current'>

export const importTemplateUpload = async (folderName: string) => {
  console.log(`Analysing uploaded template...`)

  const fullTemplateFolderPath = path.join(FILES_FOLDER, folderName)

  let info: InfoFile
  let template: TemplateStructure

  try {
    info = await fsx.readJSON(path.join(fullTemplateFolderPath, 'info.json'))
  } catch (_) {
    throw new ApiError('info.json file missing from upload', 400)
  }

  if (semverCompare(info.version, config.version) === 1) {
    throw new ApiError(
      `Template was exported with Conforma version: ${info.version}\n You can't install a template created with a version newer than the current application version: ${config.version}`,
      400
    )
  }

  try {
    template = await fsx.readJSON(path.join(fullTemplateFolderPath, 'template.json'))
  } catch (_) {
    throw new ApiError('template.json file missing from upload', 400)
  }

  const { filters, permissions, dataViews, dataViewColumns, category, dataTables } = template.shared

  const changedFilters = await getModifiedEntities(filters, 'filter', 'code')
  const changedPermissions = await getModifiedEntities(permissions, 'permission_name', 'name')
  const changedDataViews = await getModifiedEntities(dataViews, 'data_view', 'identifier')
  const changedDataViewColumns = await getModifiedEntities(
    dataViewColumns,
    'data_view_column_definition',
    ['table_name', 'column_name']
  )

  const categoryCode = (category.data as any).code
  const changedCategory = await getModifiedEntities(
    { [categoryCode]: category },
    'template_category',
    'code'
  )

  const changedDataTables: Record<string, unknown> = {}
  for (const dataTable of Object.keys(dataTables)) {
    const existing = await db.getRecord<PgDataTable>('data_table', dataTable, 'table_name')
    if (existing.checksum !== dataTables[dataTable].checksum) {
      const { lastModified, checksum } = dataTables[dataTable]
      const { last_modified, checksum: existingChecksum } = existing
      changedDataTables[dataTable] = {
        incoming: { lastModified, checksum },
        current: { lastModified: last_modified, checksum: existingChecksum },
      }
    }
  }

  return {
    filters: changedFilters,
    permissions: changedPermissions,
    dataViews: changedDataViews,
    dataViewColumns: changedDataViewColumns,
    category: changedCategory,
    dataTables: changedDataTables,
  }
}

export const importTemplateInstall = async (uid: number, installDetails: InstallDetails) => {
  return 'WHAT'
  //   console.log(`Exporting template: ${templateId}...`)
  //   const template = await db.getRecord<PgTemplate>('template', templateId)

  //   if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  //   if (template.version_id.startsWith('*'))
  //     throw new ApiError(`Template ${templateId} has not been committed`, 400)

  //   console.log('Building structure...')

  //   const templateStructure = await buildTemplateStructure(template)

  //   // Now dump the data to output files
  //   console.log('Outputting to disk...')
  //   const { code, version_id, version_history } = template
  //   const outputName = `${code}-${version_id}_v${((version_history as unknown[]) ?? []).length + 1}`
  //   const fullOutputPath = path.join(TEMPLATE_TEMP_FOLDER, outputName)

  //   await fsx.emptyDir(fullOutputPath)
  //   await fsx.writeJSON(path.join(fullOutputPath, 'template.json'), templateStructure, { spaces: 2 })
  //   await fsx.writeJSON(
  //     path.join(fullOutputPath, 'info.json'),
  //     { timestamp: DateTime.now().toISO(), version: config.version },
  //     { spaces: 2 }
  //   )

  //   if (templateStructure.files.length > 0) {
  //     await fsx.mkdir(path.join(fullOutputPath, 'files'))
  //     for (const file of templateStructure.files) {
  //       const { file_path, archive_path } = file
  //       await fsx.copy(
  //         path.join(FILES_FOLDER, archive_path ?? '', file_path),
  //         path.join(fullOutputPath, 'files', file_path)
  //       )
  //     }
  //   }

  //   console.log('Zipping template...')
  //   const zipFilePath = path.join(FILES_FOLDER, `${outputName}.zip`)
  //   const output = await fsx.createWriteStream(zipFilePath)
  //   const archive = archiver('zip', { zlib: { level: 9 } })

  //   await archive.pipe(output)
  //   await archive.directory(fullOutputPath, false)
  //   await archive.finalize()

  //   await fsx.remove(fullOutputPath)
  //   console.log('Returning zip')
  //   return `${outputName}.zip`
}

interface ExistingRecord extends Record<string, unknown> {
  last_modified: Date
  checksum: string
}

const getModifiedEntities = async (
  incomingEntities: LinkedEntities,
  sourceTable: string,
  keyField: string | string[]
) => {
  const changeEntities: Record<
    string,
    { incoming: LinkedEntity | null; current: LinkedEntity | null }
  > = ({} = {})

  for (const [key, { checksum, lastModified, data }] of Object.entries(incomingEntities)) {
    const values = Array.isArray(keyField) ? key.split('__') : key
    const existing = await db.getRecord<ExistingRecord>(sourceTable, values, keyField)
    if (!existing) continue
    delete existing.id

    if (sourceTable === 'permission_name')
      await replaceForeignKeyRef(
        existing,
        'permission_policy',
        'permission_policy_id',
        'permission_policy'
      )

    if (existing.checksum !== checksum) {
      const {
        checksum: existingChecksum,
        last_modified: existingLastModified,
        ...existingData
      } = existing
      if (existingLastModified === null || existingChecksum === null)
        throw new ApiError('Some existing entities have missing checksums/dates', 500)
      const [incomingDiff, existingDiff] = filterModifiedData(data, existingData)
      changeEntities[key] = {
        incoming: { checksum, lastModified, data: incomingDiff },
        current: { checksum, lastModified: existingLastModified, data: existingDiff },
      }
    }
  }
  return changeEntities
}
