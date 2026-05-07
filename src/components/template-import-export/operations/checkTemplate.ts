import { ApiError } from '../../../ApiError'
import db from '../databaseMethods'
import { getDiff, buildLinkedEntityObject, getTemplateLinkedEntities } from '../utilities'
import { getSuggestedDataViews, getSuggestedFragments } from './linkingOperations'
import { CombinedLinkedEntities, PgDataView, PgEvaluatorFragment, PgTemplate } from '../types'

export const checkTemplate = async (templateId: number) => {
  console.log(`Checking template: ${templateId}...`)
  const template = await db.getRecord<PgTemplate>('template', templateId)

  if (!template) throw new ApiError(`Template ${templateId} does not exist`, 400)

  const committed = !template.version_id.startsWith('*')

  const suggestedDataViews = await getSuggestedDataViews(templateId)
  const suggestedFragments = await getSuggestedFragments(templateId)

  const linkedEntities = (
    committed
      ? await getTemplateLinkedEntities(templateId)
      : // A simplified structure with only Data Views & Fragments as we can't
        // build a complete object if not committed
        {
          dataViews: buildLinkedEntityObject(
            await db.getJoinedEntities<PgDataView>({
              templateId,
              table: 'data_view',
              joinTable: 'template_data_view_join',
            }),
            'identifier'
          ),
          fragments: buildLinkedEntityObject(
            await db.getJoinedEntities<PgEvaluatorFragment>({
              templateId,
              table: 'evaluator_fragment',
              joinTable: 'template_evaluator_fragment_join',
            }),
            'name'
          ),
        }
  ) as CombinedLinkedEntities

  const unconnectedDataViews = suggestedDataViews
    .filter(({ identifier }) => !(identifier in linkedEntities.dataViews))
    .map(({ id, code, identifier, title }) => ({ id, code, identifier, title }))

  const unconnectedFragments = suggestedFragments.filter(
    ({ name }) => !(name in linkedEntities.fragments)
  )

  if (!committed) {
    const ready = unconnectedDataViews.length === 0 && unconnectedFragments.length === 0
    return { committed, unconnectedDataViews, unconnectedFragments, ready }
  }

  const diff = getDiff(template.linked_entity_data as CombinedLinkedEntities, linkedEntities)

  const ready =
    unconnectedDataViews.length === 0 &&
    unconnectedFragments.length === 0 &&
    Object.values(diff)
      .map((ob) => Object.values(ob))
      .flat().length === 0
  return { committed, ready, unconnectedDataViews, unconnectedFragments, diff }
}
