import path from 'path'
import fsx from 'fs-extra'
import { DataView as PgDataView, Template as PgTemplate } from '../../generated/postgres'
import { ApiError } from './ApiError'
import db from './databaseMethods'
import { getDiff } from './getDiff'
import { buildLinkedEntityObject, getTemplateLinkedEntities } from './getTemplateLinkedEntities'
import { FILES_FOLDER, FILES_TEMP_FOLDER } from '../../constants'
import { DateTime } from 'luxon'
import config from '../../config'
import archiver from 'archiver'
import { CombinedLinkedEntities } from './types'
import { buildTemplateStructure } from './buildTemplateStructure'
import { getSuggestedDataViews } from './linking'

export const exportTemplateCheck = async (templateId: number) => {
  console.log(`Checking template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  const committed = !template.version_id.startsWith('*')

  const suggestedDataViews = await getSuggestedDataViews(templateId)

  const linkedEntities = (
    committed
      ? await getTemplateLinkedEntities(templateId)
      : // A simplified structure with only Data Views as we can't build a
        // complete object if not committed
        {
          dataViews: buildLinkedEntityObject(
            await db.getJoinedEntities<PgDataView>({
              templateId,
              table: 'data_view',
              joinTable: 'template_data_view_join',
            }),
            'identifier'
          ),
        }
  ) as CombinedLinkedEntities

  const unconnectedDataViews = suggestedDataViews
    .filter(({ identifier }) => !(identifier in linkedEntities.dataViews))
    .map(({ id, code, identifier, title }) => ({ id, code, identifier, title }))

  if (!committed) {
    return { committed, unconnectedDataViews }
  }

  const diff = getDiff(template.linked_entity_data as CombinedLinkedEntities, linkedEntities)

  const ready =
    unconnectedDataViews.length === 0 &&
    Object.values(diff)
      .map((ob) => Object.values(ob))
      .flat().length === 0
  return { committed, ready, unconnectedDataViews, diff }
}

export const exportTemplateDump = async (templateId: number) => {
  console.log(`Exporting template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  if (template.version_id.startsWith('*'))
    throw new ApiError(`Template ${templateId} has not been committed`, 400)

  console.log('Building structure...')

  const templateStructure = await buildTemplateStructure(template)

  // Now dump the data to output files
  console.log('Outputting to disk...')
  const { code, version_id, version_history } = template
  const outputName = `${code}-${version_id}_v${((version_history as unknown[]) ?? []).length + 1}`
  const fullOutputPath = path.join(FILES_TEMP_FOLDER, outputName)

  await fsx.emptyDir(fullOutputPath)
  await fsx.writeJSON(path.join(fullOutputPath, 'template.json'), templateStructure, { spaces: 2 })
  await fsx.writeJSON(
    path.join(fullOutputPath, 'info.json'),
    { timestamp: DateTime.now().toISO(), version: config.version },
    { spaces: 2 }
  )

  if (templateStructure.files.length > 0) {
    await fsx.mkdir(path.join(fullOutputPath, 'files'))
    for (const file of templateStructure.files) {
      const { file_path, archive_path } = file
      await fsx.copy(
        path.join(FILES_FOLDER, archive_path ?? '', file_path),
        path.join(fullOutputPath, 'files', file_path)
      )
    }
  }

  console.log('Zipping template...')
  const zipFilePath = path.join(FILES_TEMP_FOLDER, `${outputName}.zip`)
  const output = await fsx.createWriteStream(zipFilePath)
  const archive = archiver('zip', { zlib: { level: 9 } })

  await archive.pipe(output)
  await archive.directory(fullOutputPath, false)
  await archive.finalize()

  await fsx.remove(fullOutputPath)
  console.log('Returning zip')
  config.scheduledJobs?.manuallySchedule('cleanup', 5)
  return `${outputName}.zip`
}
