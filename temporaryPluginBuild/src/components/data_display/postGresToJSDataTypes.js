"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgresToJSDataTypes = {
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
};
exports.default = postgresToJSDataTypes;
//# sourceMappingURL=postGresToJSDataTypes.js.map