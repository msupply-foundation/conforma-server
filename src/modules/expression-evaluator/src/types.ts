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
  value?: string | number | boolean | object
  type?: NodeType
  operator?: Operator
  children?: Array<IQueryNode | string | boolean | number | null | undefined>
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
  | 'stringSubstitution'
  | 'API'
  | 'pgSQL'
  | 'graphQL'
