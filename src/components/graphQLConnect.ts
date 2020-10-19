import fetch from 'node-fetch'
import * as config from '../config.json'

const endpoint = config.graphQLendpoint

const graphQLquery = async (query: string, variables: object) => {
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

export default graphQLquery
