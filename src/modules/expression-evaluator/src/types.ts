export type BasicObject = {
  [key: string]: any
}

interface QueryRowResult {
  [columns: string]: any
}

export interface QueryResult {
  rows: QueryRowResult[]
}
export interface IConnection {
  query: (expression: { text: string; values?: any[]; rowMode?: string }) => Promise<QueryResult>
}

export interface IGraphQLConnection {
  fetch: Function
  endpoint: string
}

export interface IParameters {
  objects?: BasicObject
  pgConnection?: IConnection
  graphQLConnection?: IGraphQLConnection
  APIfetch?: Function
}

export interface IQueryNode {
  value?: any
  type?: NodeType
  operator: Operator
  children: Array<IQueryNode | string | boolean | number | null | object | undefined>
}

export type NodeType = 'string' | 'number' | 'boolean' | 'array'

type Operator =
  | 'AND'
  | 'OR'
  | 'CONCAT'
  | '='
  | '!='
  | '+'
  | '?'
  | 'REGEX'
  | 'objectProperties'
  | 'stringSubstitution'
  | 'GET'
  | 'POST'
  | 'pgSQL'
  | 'graphQL'
