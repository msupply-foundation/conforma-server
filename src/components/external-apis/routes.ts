import path from 'path'
import { rmdirSync, readFileSync, writeFile } from 'fs'
import { promisify } from 'util'
import {
  getAppEntryPointDir,
  combineRequestParams,
  makeFolder,
} from '../../components/utilityFunctions'
import config from '../../config'
import { DateTime } from 'luxon'

const { localisationsFolder } = config

const writeFilePromise = promisify(writeFile)

export type LanguageOption = {
  languageName: string
  description: string
  code: string
  locale?: string
  flag: string // To-do: limit to flag emojis
  enabled: boolean
}

export const routeAccessExternalApi = async (request: any, reply: any) => {
  const { code } = request.params

  return reply.send('DONE')
}
