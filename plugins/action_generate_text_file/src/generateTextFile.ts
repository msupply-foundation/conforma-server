import { ActionQueueStatus, File } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import fs from 'fs-extra'
import os from 'os'
import path from 'path'
import { errorMessage } from '../../../src/components/utilityFunctions'
import { registerFileInDB } from '../../../src/components/files/fileHandler'
import { FILES_FOLDER } from '../../../src/constants'

const DEFAULT_OUTPUT_PATH = '_textFiles'
const HOME_FOLDER = os.homedir()

async function generateTextFile({ parameters }: ActionPluginInput): Promise<ActionPluginOutput> {
  const {
    text,
    data,
    filename,
    outputPath = DEFAULT_OUTPUT_PATH,
    registerInDatabase = false,
    fileData = {},
  } = parameters as {
    text?: string
    data?: Record<string, any>
    filename: string
    outputPath: string
    registerInDatabase: boolean
    fileData?: Partial<File>
  }

  if (!text && !data)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Neither text or data provided',
    }

  if (!filename)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'Filename not provided',
    }

  if (path.isAbsolute(outputPath) && registerInDatabase)
    return {
      status: ActionQueueStatus.Fail,
      error_log: 'outputPath cannot be an absolute path if file is to be registered in database',
    }

  // Text takes precedence over Data
  const outputText = typeof text === 'string' ? text : JSON.stringify(data, null, 2)

  try {
    console.log('Exporting text:', outputText)

    // Database files are placed relative Conforma "files" folder, other files
    // relative to home folder (or as-is if absolute path)
    const baseFolder = registerInDatabase
      ? FILES_FOLDER
      : path.isAbsolute(outputPath)
      ? ''
      : HOME_FOLDER

    const outputFolder = path.join(baseFolder, outputPath)
    const fullFilePath = path.join(outputFolder, filename)

    await fs.outputFile(fullFilePath, outputText)
    console.log('File created:', fullFilePath)

    let dbFile
    if (registerInDatabase) {
      dbFile = await registerFileInDB({
        ...fileData,
        filePath: path.join(outputPath, filename),
        mimetype: 'text/plain',
      })
      console.log('File registered in database')
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { outputFilePath: fullFilePath, outputText, dbFile },
    }
  } catch (error) {
    console.log(errorMessage(error))
    return {
      status: ActionQueueStatus.Fail,
      error_log: errorMessage(error),
    }
  }
}

export default generateTextFile
