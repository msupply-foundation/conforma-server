import fetch from 'node-fetch'
import * as config from '../config.json'

const endpoint = config.graphQLendpoint

class GraphQLdb {
  private static _instance: GraphQLdb

  // constructor() {}

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  public gqlQuery = async (query: string, variables = {}) => {
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

  public getOriginalRecordFromActionQueue = async (tableName: string, record_id: number) => {
    if (tableName !== 'action_queue') throw new Error('Not an action_queue event')
    const query = `query getTemplateIdFromActionQueue($record_id:Int!) {
      actionQueue(id: $record_id) {
        triggerQueueByTriggerEvent {
          table
          recordId
          triggerType
        }
      }
    }`
    const variables = { record_id }
    const result = await this.gqlQuery(query, variables)
    const table = result.actionQueue.triggerQueueByTriggerEvent.table
    const origRecordId = result.actionQueue.triggerQueueByTriggerEvent.record_id
    return { table, recordId: origRecordId }
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
