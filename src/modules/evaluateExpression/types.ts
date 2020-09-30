import { QueryResult } from 'pg'

export interface IConnection {
  query: (text: string, params: any[]) => Promise<QueryResult>
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
