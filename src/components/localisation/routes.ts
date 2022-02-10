import path from 'path'
import { mkdirSync, readFileSync, writeFile } from 'fs'
import { promisify } from 'util'
import { getAppEntryPointDir } from '../../components/utilityFunctions'
import { combineRequestParams } from '../../components/utilityFunctions'
import config from '../../config'
import { type } from 'os'

const { localisationsFolder } = config

const writeFilePromise = promisify(writeFile)

export type LanguageOption = {
  languageName: string
  description: string
  code: string
  flag: string // To-do: limit to flag emojis
  enabled: boolean
}

export const routeGetLanguageFile = async (request: any, reply: any) => {
  const { code } = request.params
  const stringsFile = path.join(code, 'strings.json')
  reply.sendFile(stringsFile, path.join(getAppEntryPointDir(), localisationsFolder))
}

export const routeEnableLanguage = async (request: any, reply: any) => {
  const { code, enabled } = combineRequestParams(request)
  const languageOptions = JSON.parse(
    readFileSync(path.join(getAppEntryPointDir(), '../localisation/languages.json'), 'utf8')
  )
  const index = languageOptions.findIndex((language: LanguageOption) => language.code === code)
  if (index === -1) return reply.send({ success: false, message: 'Code not recognised' })

  const changedLanguage = {
    ...languageOptions[index],
    enabled:
      enabled === 'true' ? true : enabled === 'false' ? false : !languageOptions[index].enabled,
  }
  languageOptions[index] = changedLanguage

  // Write file back
  try {
    await writeFilePromise(
      path.join(getAppEntryPointDir(), '../localisation/languages.json'),
      JSON.stringify(languageOptions, null, 2)
    )
    return reply.send({ success: true, data: languageOptions })
  } catch (err) {
    return reply.send({
      sucess: false,
      message: 'Problem saving language preferences' + err.message,
    })
  }
}

export const routeInstallLanguage = async (request: any, reply: any) => {
  const { language, strings } = request.body
  if (!checkLanguageFormat(language))
    return reply.send({ success: false, message: 'Incorrect language data' })
  if (!checkStrings(strings))
    return reply.send({ success: false, message: 'Incorrect strings format' })
  language.enabled = true

  const languageOptions = JSON.parse(
    readFileSync(path.join(getAppEntryPointDir(), '../localisation/languages.json'), 'utf8')
  )
  const index = languageOptions.findIndex((lang: LanguageOption) => language.code === lang.code)
  let message: string
  if (index === -1) {
    languageOptions.push(language)
    message = `New language added: ${language.languageName} / ${language.code}`
  } else {
    languageOptions[index] = language
    message = `Language updated: ${language.languageName} / ${language.code}`
  }

  // Write files
  try {
    await writeFilePromise(
      path.join(getAppEntryPointDir(), '../localisation/languages.json'),
      JSON.stringify(languageOptions, null, 2)
    )
    try {
      mkdirSync(path.join(getAppEntryPointDir(), `../localisation/${language.code}/`))
    } catch {
      // Folder already exists
    }
    await writeFilePromise(
      path.join(getAppEntryPointDir(), `../localisation/${language.code}/strings.json`),
      JSON.stringify(strings, null, 2)
    )
    return reply.send({ success: true, message })
  } catch (err) {
    return reply.send({ sucess: false, message: 'Problem installing language:' + err.message })
  }
}

const checkLanguageFormat = (language: LanguageOption) => {
  return (
    typeof language === 'object' &&
    language.code &&
    typeof language.code === 'string' &&
    language.languageName &&
    typeof language.languageName === 'string' &&
    language.description &&
    typeof language.description === 'string' &&
    language.flag &&
    typeof language.flag === 'string'
  )
}

const checkStrings = (strings: object) => {
  return (
    typeof strings === 'object' &&
    Object.values(strings).every((string) => typeof string === 'string') &&
    Object.keys(strings).length > 0
  )
}
