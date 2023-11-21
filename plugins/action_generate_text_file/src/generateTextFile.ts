import { ActionQueueStatus, File } from '../../../src/generated/graphql'
import { ActionPluginOutput, ActionPluginInput } from '../../types'
import fs from 'fs-extra'
import path from 'path'
import { errorMessage } from '../../../src/components/utilityFunctions'
import { registerFileInDB } from '../../../src/components/files/fileHandler'
import { FILES_FOLDER } from '../../../src/constants'

const DEFAULT_PATH = path.join('_textFiles')

async function generateTextFile({ parameters }: ActionPluginInput): Promise<ActionPluginOutput> {
  const {
    text,
    data,
    filename,
    outputPath = DEFAULT_PATH,
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

    // If the output file is to be registered in the database, then it must be
    // placed in the "files" folder
    const outputFolder = registerInDatabase ? path.join(FILES_FOLDER, outputPath) : outputPath

    await fs.outputFile(path.join(outputFolder, filename), outputText)

    let dbFile
    if (registerInDatabase) {
      dbFile = await registerFileInDB({
        ...fileData,
        folderPath: outputPath,
        filename,
        mimetype: 'text/plain',
      })
    }

    return {
      status: ActionQueueStatus.Success,
      error_log: '',
      output: { outputFilePath: path.join(outputFolder, filename), outputText, dbFile },
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
