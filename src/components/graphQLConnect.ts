import fetch from 'node-fetch'
import config from '../config'
import { getAdminJWT } from './permissions/loginHelpers'

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
          isLastStage
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
}

const graphqlDBInstance = GraphQLdb.Instance
export default graphqlDBInstance
