import path from 'path';
import fs from 'fs';
import util from 'util';
import { pipeline } from 'stream';
import getAppRootDir from './getAppRoot';
import { pgClient } from './postgresConnect';
import * as config from '../config.json';

export const filesFolderName = config.filesFolderName;

interface HttpQueryParameters {
  [key: string]: string;
}

export function createFilesFolder() {
  try {
    fs.mkdirSync(path.join(getAppRootDir(), filesFolderName));
  } catch {
    // Folder already exists
  }
}

export async function getFilename(id: string) {
  const result = await pgClient.query('SELECT path, original_filename FROM file WHERE id = $1', [
    id,
  ]);
  const folder = result.rows[0].path; // Not currently used
  const filenameOrig = result.rows[0].original_filename;
  const ext = path.extname(String(filenameOrig));
  const basename = path.basename(filenameOrig, ext);
  return `${basename}_${id}${ext}`;
}

const pump = util.promisify(pipeline);
export async function saveFiles(data: any, queryParams: HttpQueryParameters) {
  for await (const file of data) {
    await pump(
      file.file,
      fs.createWriteStream(path.join(getAppRootDir(), filesFolderName, file.filename))
    );

    const parameters = { ...queryParams };

    ['user_id', 'application_id', 'application_response_id'].forEach((field) => {
      const queryFieldValue = queryParams[field];
      const bodyFieldValue = file.fields[field] ? file.fields[field].value : undefined;
      parameters[field] = queryFieldValue ? queryFieldValue : bodyFieldValue;
    });
    const fileID = await registerFileInDB(file, parameters);
  }
}

async function registerFileInDB(file: any, parameters: any) {
  // Insert record into Db and get back ID
  const query = {
    text:
      'INSERT INTO file (user_id, original_filename, path, mimetype, application_id, application_response_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;',
    values: [
      parameters.user_id,
      file.filename,
      filesFolderName,
      file.mimetype,
      parameters.application_id,
      parameters.application_response_id,
    ],
  };
  const result = await pgClient.query(query);
  const fileID = result.rows[0].id;
  // Rename file with ID
  const ext = path.extname(file.filename);
  const basename = path.basename(file.filename, ext);
  fs.rename(
    path.join(getAppRootDir(), filesFolderName, file.filename),
    path.join(getAppRootDir(), filesFolderName, `${basename}_${fileID}${ext}`),
    () => {}
  );
}
