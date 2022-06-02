export type PostgresDataType =
  | 'ARRAY'
  | 'bigint'
  | 'bigserial'
  | 'bit'
  | 'bit varying'
  | 'boolean'
  | 'box'
  | 'bytea'
  | 'character'
  | 'character varying'
  | 'cidr'
  | 'circle'
  | 'date'
  | 'double precision'
  | 'inet'
  | 'integer'
  | 'interval'
  | 'json'
  | 'jsonb'
  | 'line'
  | 'lseg'
  | 'macaddr'
  | 'money'
  | 'numeric'
  | 'path'
  | 'pg_lsn'
  | 'point'
  | 'polygon'
  | 'real'
  | 'smallint'
  | 'smallserial'
  | 'serial'
  | 'text'
  | 'time without time zone'
  | 'time with time zone'
  | 'timestamp without time zone'
  | 'timestamp with time zone'
  | 'tsquery'
  | 'tsvector'
  | 'txid_snapshot'
  | 'uuid'
  | 'xml'

type JSDataType = 'number' | 'string' | 'boolean' | 'array' | 'object' | 'Date'

export type TypeMap = {
  [key in PostgresDataType]?: JSDataType
}

const postgresToJSDataTypes: TypeMap = {
  ARRAY: 'array',
  bigint: 'number',
  integer: 'number',
  boolean: 'boolean',
  character: 'string',
  'character varying': 'string',
  date: 'Date',
  'double precision': 'number',
  json: 'object',
  jsonb: 'object',
  real: 'number',
  text: 'string',
  'time with time zone': 'Date',
  'time without time zone': 'Date',
  'timestamp with time zone': 'Date',
  'timestamp without time zone': 'Date',
}
export default postgresToJSDataTypes
