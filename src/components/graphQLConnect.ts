import fetch from 'node-fetch'
import * as config from '../config.json'

const endpoint = config.graphQLendpoint

class GraphQLdb {
  private static _instance: GraphQLdb

  // constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public gqlQuery = async (query: string, variables: object) => {
    const queryResult = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: query,
        variables: variables,
      }),
    })
    const data = await queryResult.json()
    return data.data
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
