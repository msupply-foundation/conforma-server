import path from 'path'
import { getAppEntryPointDir } from '../../components/utilityFunctions'
import config from '../../config'

const { localisationsFolder } = config

export const routeGetLanguageFile = async (request: any, reply: any) => {
  const { code } = request.params
  const stringsFile = path.join(code, 'strings.json')
  reply.sendFile(stringsFile, path.join(getAppEntryPointDir(), localisationsFolder))
}

export const updateLanguageFiles = async (request: any, reply: any) => {}
