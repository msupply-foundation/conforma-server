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
export const makeFolder = (folderPath: string, message?: string) => {
  if (!fs.existsSync(folderPath)) {
    message && console.log(message)
    fs.mkdirSync(folderPath)
  }
}

// Given an array of objects, returns only distinct ones, as determined by a
// specified property. When more than one exists, a "priority" field can be
// specified to determine which to keep, otherwise it will return the first one.
// Preserves the order of the original input array
// TO-DO: Allow custom comparitor function
type BasicObject = { [key: string]: any }
type IndexObject = { [key: string]: number }
export const getDistinctObjects = (
  objectArray: BasicObject[],
  matchProperty: string,
  priorityProperty: string | null = null
) => {
  const distinctValues = new Set()
  const highestPriorityIndexRecord: IndexObject = {}
  const outputArray: BasicObject[] = []
  objectArray.forEach((item) => {
    if (!(matchProperty in item)) throw new Error('matchProperty not found on Object')
    const value = item[matchProperty]
    if (!distinctValues.has(value)) {
      distinctValues.add(value)
      const index = outputArray.push(item) - 1
      highestPriorityIndexRecord[JSON.stringify(value)] = index
    } else {
      if (!priorityProperty) return
      // Is the new one higher?
      const prevIndex = highestPriorityIndexRecord[JSON.stringify(value)]
      if (item?.[priorityProperty] > outputArray[prevIndex][priorityProperty])
        outputArray[prevIndex] = item
    }
  })
  return outputArray
}

// Given an object, returns a new object with all keys removed whose values
// return false when passed into the 2nd parameter function. Can be use (for
// example) to remove keys with null or undefined values (the default)
// Eg. {one: 1, two: null, three: undefined} => {one: 1}
type FilterFunction = (x: any) => boolean
export const filterObject = (
  inputObj: BasicObject,
  filterFunction: FilterFunction = (x) => x != null
) => {
  const filtered = Object.entries(inputObj).filter(([_, value]) => filterFunction(value))
  return Object.fromEntries(filtered)
}

export const capitaliseFirstLetter = (str: string) => str[0].toUpperCase() + str.slice(1)
