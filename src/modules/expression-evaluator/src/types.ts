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

export interface OperatorNode {
  operator: Operator
  type?: OutputType
  children: Array<OperatorNode | ValueNode>
  value?: ValueNode // deprecated
}

export type ValueNode = string | boolean | number | BasicObject | null | undefined | any[]

export type OutputType = 'string' | 'number' | 'boolean' | 'array'

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
  | 'API'
  | 'pgSQL'
  | 'graphQL'
