import fetch from 'node-fetch'
import config from '../config'
import { getAdminJWT } from './permissions/loginHelpers'
import path from 'path'

const endpoint = config.graphQLendpoint

class GraphQLdb {
  private static _instance: GraphQLdb
  adminJWT: string = ''

  // constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public gqlQuery = async (query: string, variables = {}, authHeader = '') => {
    if (this.adminJWT === '') this.adminJWT = await getAdminJWT()
    const queryResult = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader === '' ? `Bearer ${this.adminJWT}` : authHeader,
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
    const data = await queryResult.json()
    if (data.errors)
      throw new Error(
        `problem executing gql: ${query} variables: ${variables} errors: ${JSON.stringify(
          data.errors,
          null,
          ' '
        )}`
      )
    return data.data
  }

  public getAdditionalUserData = async (userId: number) => {
    const data = await this.gqlQuery(
      `
      query getUser($userId: Int!) {
        users(condition: { id: $userId }) {
          nodes { 
            firstName
            lastName
            fullName
            username
            email
            address
            country
            dateOfBirth
            phone
          }
        }
      }`,
      { userId }
    )
    return data.users.nodes[0]
  }

  public getReviewData = async (reviewId: number) => {
    const data = await this.gqlQuery(
      `
      query getReviewData($id: Int!) {
        review(id: $id) {
          levelNumber
          isLastLevel
          isLastStage
          status
          isLocked
          reviewer {
            id
            username
            firstName
            lastName
          }
          latestDecision {
              decision
              comment
          }
        }
      }
      `,
      { id: reviewId }
    )
    // User email not exposed on reviewer node, so must be queried separately
    const reviewerId = data?.review?.reviewer?.id
    if (reviewerId) {
      data.review.reviewer.email = (await this.getAdditionalUserData(reviewerId)).email
    }
    return data.review
  }

  public getReviewDataFromAssignment = async (reviewAssignmentId: number) => {
    console.log('reviewAssignmentId', reviewAssignmentId)
    const data = await this.gqlQuery(
      `
      query getReview($reviewAssignmentId: Int!) {
        reviews(filter: { reviewAssignmentId: { equalTo: $reviewAssignmentId } }) {
          nodes {
            reviewId: id
            levelNumber
            isLastLevel
            isLastStage
            status
            isLocked
            reviewer {
              id
              username
              firstName
              lastName
            }
            latestDecision {
                decision
                comment
            }
          }
        }
      }
      `,
      { reviewAssignmentId }
    )
    // User email not exposed on reviewer node, so must be queried separately
    const reviewerId = data?.reviews?.nodes?.[0]?.reviewer?.id
    if (reviewerId) {
      data.reviews.nodes[0].reviewer.email = (await this.getAdditionalUserData(reviewerId)).email
    }
    return data?.reviews?.nodes[0] || null
  }

  public isInternalOrg = async (orgId: number): Promise<boolean> => {
    const data = await this.gqlQuery(
      `
      query getOrganisation($orgId: Int!) {
        organisation(id: $orgId) {
          isSystemOrg
        }
      }
      `,
      { orgId }
    )
    return data?.organisation?.isSystemOrg ?? false
  }

  public getTemplateId = async (tableName: string, record_id: number): Promise<number> => {
    switch (tableName) {
      default:
        throw new Error('Method not yet implemented for this table')
    }
    // Not implemented yet -- needs more data in DB
  }

  public getAllApplicationTriggers = async (serial: string) => {
    const data = await this.gqlQuery(
      `
      query getTriggers($serial: String!) {
        applicationBySerial(serial: $serial) {
          reviewAssignments {
            nodes {
              id
              trigger
            }
          }
          reviews {
            nodes {
              id
              trigger
            }
          }
          verifications {
            nodes {
              id
              trigger
            }
          }
          applicationId: id
          applicationTrigger: trigger
        }
      }
      `,
      { serial }
    )
    return data?.applicationBySerial || null
  }

  public getTemplatePermissionsFromApplication = async (applicationId: number) => {
    const data = await this.gqlQuery(
      `
      query getTemplatePermissions($applicationId: Int!) {
        application(id: $applicationId) {
          template {
            templatePermissions {
              nodes {
                permissionName {
                  name
                  isSystemOrgPermission
                  permissionPolicy {
                    name
                    type
                  }
                }
              }
            }
          }
        }
      }
    `,
      { applicationId }
    )
    return data?.application.template.templatePermissions.nodes || null
  }

  public getFilePaths = async (batchSize: number, offset: number) => {
    const data = await this.gqlQuery(
      `
      query getFilePaths($first:Int!, $offset:Int!) {
        files(first: $first, offset: $offset) {
          nodes {
            archivePath
            filePath
            id
          }
        }
      }
      `,
      { first: batchSize, offset }
    )
    return (
      data?.files?.nodes.map(({ archivePath, filePath, id }: any) => ({
        filePath: path.join(archivePath ?? '', filePath),
        id,
      })) || []
    )
  }
}

const graphqlDBInstance = GraphQLdb.Instance
export default graphqlDBInstance
