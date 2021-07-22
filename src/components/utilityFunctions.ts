import path from 'path'
import fs from 'fs'
import { camelCase, snakeCase, mapKeys } from 'lodash'

// Determines the folder of the main entry file, as opposed to the
// project root. Needed for components that traverse the local directory
// structure (e.g. fileHandler, registerPlugins), as the project
// root changes its relative path once built.
export function getAppEntryPointDir() {
  return path.dirname(__dirname)
}

// Convert object keys to camelCase
export const objectKeysToCamelCase = (obj: { [key: string]: any }) =>
  mapKeys(obj, (_, key) => camelCase(key))

// Convert object keys to snake_case
export const objectKeysToSnakeCase = (obj: { [key: string]: any }) =>
  mapKeys(obj, (_, key) => snakeCase(key))

// Combine both query parameters and Body JSON fields from http request
// into single object
// Note: Body parameters take precedence
export const combineRequestParams = (request: any, outputCase: OutputCase | null = null) => {
  const query = request.query
  const bodyJSON = request.body
  if (outputCase === 'snake') return objectKeysToSnakeCase({ ...query, ...bodyJSON })
  if (outputCase === 'camel') return objectKeysToCamelCase({ ...query, ...bodyJSON })
  return { ...query, ...bodyJSON }
}

type OutputCase = 'snake' | 'camel'

// Create folder if it doesn't already exist
export const makeFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath)
}
