// An endpoint for providing lists of files, but only ones the user should have
// permission to access. Namely:
// - files associated with an application user has permission to view
// - files marked "external_reference_doc" can be accessed by anyone
// - files marked "internal_reference_doc" can be accessed by internal users
//
// The actual files themselves can still be accessed by anyone who has the
// correct file ID via the public /file endpoint

import DBConnect from '../databaseConnect'
import { getDistinctObjects, getValidTableName, objectKeysToCamelCase } from '../utilityFunctions'

import { camelCase, kebabCase } from 'lodash'
import { File } from '../../generated/graphql'
import config from '../../config'
import { FastifyReply, FastifyRequest } from 'fastify'

type FileData = Pick<
  File,
  'uniqueId' | 'description' | 'filePath' | 'originalFilename' | 'thumbnailPath' | 'timestamp'
>

export const routeFileLists = async (request: FastifyRequest, reply: FastifyReply) => {
  const files: FileData[] = []

  // if applicationId:
  // - request application using user JWT
  // - if result, get files for application
  // - if not get nothing
  // - push to files array

  // if external = true:
  // - get external docs
  // - push to files array

  // if internal = true
  // - check user JWT for system org
  // - if so get internal docs
  // - push to files array

  return reply.send(files)
}
