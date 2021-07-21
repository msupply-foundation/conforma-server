import fetch from 'node-fetch'
import config from '../config'
import { getAdminJWT } from './permissions/loginHelpers'
import { Template } from '../generated/graphql'

const endpoint = config.graphQLendpoint

class GraphQLdb {
  private static _instance: GraphQLdb
  adminJWT: string = ''

  // constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public gqlQuery = async (query: string, variables = {}) => {
    if (this.adminJWT === '') this.adminJWT = await getAdminJWT()
    const queryResult = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.adminJWT}`,
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

  public getReviewData = async (reviewId: number) => {
    const data = await this.gqlQuery(
      `
      query getReviewData($id: Int!) {
        review(id: $id) {
          levelNumber
          isLastLevel
          status
          latestDecision {
              decision
              comment
          }
          reviewAssignment {
            isLocked
          }
        }
      }
      `,
      { id: reviewId }
    )
    return data.review
  }

  public getTemplateId = async (tableName: string, record_id: number): Promise<number> => {
    switch (tableName) {
      default:
        throw new Error('Method not yet implemented for this table')
    }
    // Not implemented yet -- needs more data in DB
  }

  public getTemplateData = async (templateId: number): Promise<Template> => {
    const data = await this.gqlQuery(
      `
        query getTemplateData($templateId: Int!) {
          template(id: $templateId) {
            id
            code
            name
            status
            isLinear
            startMessage
            submissionMessage
            version
            versionTimestamp
            templateCategory {
              code
              id
              title
            }
            templateSections {
              nodes {
                id
                code
                index
                title
                templateElementsBySectionId {
                  nodes {
                    id
                    code
                    category
                    elementTypePluginCode
                    title
                    index
                    defaultValue      
                    helpText
                    visibilityCondition
                    isEditable
                    isRequired
                    validation
                    validationMessage
                    parameters
                  }
                }
              }
            }
            templateStages {
              nodes {
                id
                number
                title
                description
                colour
              }
            }
            templateActions {
              nodes {
                id
                actionCode
                sequence
                condition
                parameterQueries
                trigger
              }
            }
            templatePermissions {
              nodes {
                id
                permissionName {
                  name
                  id
                }
                stageNumber
                levelNumber
                allowedSections
                canSelfAssign        
                restrictions
              }
            }
          }
        }      
      `,
      { templateId }
    )
    return data.template
  }
}

const graphqlDBInstance = GraphQLdb.Instance
export default graphqlDBInstance
