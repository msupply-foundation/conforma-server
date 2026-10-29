import { ApiError } from '../../ApiError'
import databaseConnect from '../database/databaseConnect'
import { ExtractionElement } from './types'

// The web-app's form element that runs AI document fill. Placing it in a
// template is how a form opts in.
export const AI_FILL_PLUGIN_CODE = 'aiDocumentFill'

export interface TemplateElementRow {
  code: string
  pluginCode: string | null
  category: string | null
}

/**
 * Checks the template opts in to AI document fill and that every element sent
 * is one of its questions, with the same plugin, so the endpoint only answers
 * questions the application's form actually has. Throws an ApiError
 * otherwise.
 */
export const validateTemplateElements = (
  templateElements: TemplateElementRow[],
  elements: ExtractionElement[]
) => {
  // 404 like an application the caller can't apply for: AI document fill
  // doesn't exist for this form
  if (!templateElements.some(({ pluginCode }) => pluginCode === AI_FILL_PLUGIN_CODE))
    throw new ApiError("This application's form doesn't use AI document fill", 404)

  const questionPlugins = new Map(
    templateElements
      .filter(({ category }) => category === 'QUESTION')
      .map(({ code, pluginCode }) => [code, pluginCode])
  )
  const unknown = elements
    .filter(({ code, pluginCode }) => questionPlugins.get(code) !== pluginCode)
    .map(({ code }) => code)
  if (unknown.length > 0)
    throw new ApiError(`Not questions of this application's form: ${unknown.join(', ')}`, 400)
}

export const checkTemplateElements = async (templateId: number, elements: ExtractionElement[]) => {
  const { rows } = await databaseConnect.query({
    text: `SELECT e.code, e.element_type_plugin_code AS "pluginCode", e.category
      FROM template_element e JOIN template_section s ON s.id = e.section_id
      WHERE s.template_id = $1`,
    values: [templateId],
  })
  validateTemplateElements(rows, elements)
}
