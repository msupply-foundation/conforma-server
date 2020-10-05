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

export interface IParameters {
  [key: string]: any
  connection?: IConnection
}

export interface IQueryNode {
  value?: string | number | boolean | object
  type?: NodeType
  operator?: Operator
  children?: Array<IQueryNode>
}

type NodeType = 'string' | 'number' | 'boolean' | 'array'

type Operator =
  | 'AND'
  | 'OR'
  | 'CONCAT'
  | '='
  | '!= '
  | '+'
  | 'REGEX'
  | 'objectProperties'
  | 'pgSQL'
  | 'graphQL'

export interface IGraphQLConnection {
  fetch: any // Don't know type of fetch object
  endpoint: string
}
