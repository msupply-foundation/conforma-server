"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructDetailsResponse = exports.constructTableResponse = exports.buildAllColumnDefinitions = exports.getPermissionNamesFromJWT = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const utilityFunctions_1 = require("../utilityFunctions");
const expression_evaluator_1 = __importDefault(require("@openmsupply/expression-evaluator"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const lodash_1 = require("lodash");
// @ts-ignore
const map_values_deep_1 = __importDefault(require("map-values-deep"));
const postGresToJSDataTypes_1 = __importDefault(require("./postGresToJSDataTypes"));
const config_1 = __importDefault(require("../../config"));
const pluralize_1 = require("pluralize");
// CONSTANTS
const REST_OF_DATAVIEW_FIELDS = '...';
const graphQLEndpoint = config_1.default.graphQLendpoint;
exports.getPermissionNamesFromJWT = (request) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, orgId } = request.auth;
    const permissionNames = yield (yield databaseConnect_1.default.getUserOrgPermissionNames(userId, orgId)).map((result) => result.permissionName);
    return { userId, orgId, permissionNames };
});
exports.buildAllColumnDefinitions = ({ permissionNames, dataViewCode, type, userId, orgId, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Look up allowed Data views
    const dataViews = (yield databaseConnect_1.default.getAllowedDataViews(permissionNames, dataViewCode))
        .map((dataView) => utilityFunctions_1.objectKeysToCamelCase(dataView))
        .sort((a, b) => b.priority - a.priority);
    if (dataViews.length === 0)
        throw new Error(`No matching data views: "${dataViewCode}"`);
    const dataView = dataViews[0];
    const { tableName, title, code } = dataView;
    const tableNameProper = lodash_1.camelCase(utilityFunctions_1.getValidTableName(tableName));
    // Generate graphQL filter object
    const gqlFilters = getFilters(dataView, userId, orgId);
    // Only for details view
    const headerColumnName = (_a = dataView.detailViewHeaderColumn) !== null && _a !== void 0 ? _a : '';
    const showLinkedApplications = dataView.showLinkedApplications;
    // Get all Fields on Data table (schema query)
    const fields = (yield databaseConnect_1.default.getDataTableColumns(lodash_1.snakeCase(tableNameProper))).map(({ name, dataType }) => {
        var _a;
        return ({
            name: lodash_1.camelCase(name),
            dataType: (_a = postGresToJSDataTypes_1.default === null || postGresToJSDataTypes_1.default === void 0 ? void 0 : postGresToJSDataTypes_1.default[dataType]) !== null && _a !== void 0 ? _a : dataType,
        });
    });
    const fieldNames = fields.map((field) => field.name);
    const fieldDataTypes = fields.reduce((dataTypeIndex, field) => {
        dataTypeIndex[field.name] = field.dataType;
        return dataTypeIndex;
    }, {});
    // Get all returning column names (include/exclude + custom columns)
    const columnsToReturn = buildColumnList(dataView, fieldNames, type);
    // Get all associated display column_definition records
    const customDisplayDefinitions = yield buildColumnDisplayDefinitions(tableName, [
        ...columnsToReturn,
        headerColumnName,
    ]);
    // Build complete column definition list from the above
    const fieldNameSet = new Set(fieldNames);
    const columnDefinitionMasterList = columnsToReturn.map((column) => ({
        columnName: column,
        isBasicField: fieldNameSet.has(column),
        dataType: fieldDataTypes[column],
        columnDefinition: customDisplayDefinitions[column],
    }));
    // Build header definition (only for Detail view)
    const headerDefinition = type === 'DETAIL'
        ? {
            columnName: headerColumnName,
            isBasicField: fieldNameSet.has(headerColumnName),
            dataType: fieldDataTypes[headerColumnName],
            columnDefinition: customDisplayDefinitions[headerColumnName],
        }
        : undefined;
    return {
        tableName: tableNameProper,
        title: title !== null && title !== void 0 ? title : pluralize_1.plural(lodash_1.startCase(tableName)),
        code,
        columnDefinitionMasterList,
        gqlFilters,
        fieldNames,
        headerDefinition,
        showLinkedApplications,
    };
});
const getFilters = (dataView, userId, orgId) => {
    const restrictions = dataView.rowRestrictions == null || Object.keys(dataView.rowRestrictions).length === 0
        ? { id: { isNull: false } }
        : dataView.rowRestrictions;
    // Substitute userId/orgId placeholder with actual values
    return map_values_deep_1.default(restrictions, (node) => {
        if (typeof node !== 'string')
            return node;
        switch (node) {
            case '$userId':
                return userId;
            case '$orgId':
                return orgId !== null && orgId !== void 0 ? orgId : 0;
            default:
                return node;
        }
    });
};
const buildColumnList = (dataView, allColumns, type) => {
    const includeField = type === 'TABLE' ? 'tableViewIncludeColumns' : 'detailViewIncludeColumns';
    const excludeField = type === 'TABLE' ? 'tableViewExcludeColumns' : 'detailViewExcludeColumns';
    const includeColumns = dataView[includeField] === null
        ? allColumns
        : dataView[includeField]
            // Expand "..." to all fields (so we don't have to enter the full
            // field list in "includeColumns" when also adding a "custom" field)
            .map((col) => (col === REST_OF_DATAVIEW_FIELDS ? allColumns : col))
            .flat();
    const excludeColumns = dataView[excludeField] !== null ? dataView[excludeField] : [];
    // Convert to Set to remove duplicate columns due to expanded (...) field list
    const includeSet = new Set(includeColumns);
    return [...includeSet].filter((x) => !excludeColumns.includes(x));
};
const buildColumnDisplayDefinitions = (tableName, columns) => __awaiter(void 0, void 0, void 0, function* () {
    const columnDefinitionArray = yield databaseConnect_1.default.getDataViewColumnDefinitions(tableName, columns);
    const columnDisplayDefinitions = {};
    columnDefinitionArray.forEach((item) => {
        columnDisplayDefinitions[item.column_name] = utilityFunctions_1.objectKeysToCamelCase(item);
    });
    return columnDisplayDefinitions;
});
exports.constructTableResponse = (tableName, title, code, columnDefinitionMasterList, fetchedRecords, totalCount) => __awaiter(void 0, void 0, void 0, function* () {
    // Build table headers, which also carry any additional display/format
    // definitions for each column
    const headerRow = columnDefinitionMasterList.map(({ columnName, isBasicField, dataType, columnDefinition = {} }) => {
        const { title, elementTypePluginCode, elementParameters, additionalFormatting } = columnDefinition;
        return {
            columnName,
            title: title !== null && title !== void 0 ? title : lodash_1.startCase(columnName),
            isBasicField,
            dataType,
            formatting: Object.assign({ elementTypePluginCode: elementTypePluginCode || undefined, elementParameters: elementParameters || undefined }, additionalFormatting),
        };
    });
    // Construct table rows by iterating over data table records
    //  - for columns that need evaluation, we put all the Promises into an array
    //    (evaluationPromiseArray) so they can all be run asynchronously in
    //    parallel. We also need to keep track of where they belong in the main
    //    structure so we can replace them once all Promises are resolved
    //    (evaluationIndexArray).
    const evaluationPromiseArray = [];
    const evaluationIndexArray = [];
    const tableRows = fetchedRecords.map((record, rowIndex) => {
        const thisRow = columnDefinitionMasterList.map((cell, colIndex) => {
            var _a;
            const { columnName, isBasicField, columnDefinition } = cell;
            if (isBasicField && !(columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression))
                return record[columnName];
            else if (!(columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression))
                return 'Field not defined';
            else {
                evaluationPromiseArray.push(expression_evaluator_1.default((_a = columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression) !== null && _a !== void 0 ? _a : {}, {
                    objects: Object.assign(Object.assign({}, record), { thisField: record[columnName] }),
                    // pgConnection: DBConnect, probably don't want to allow SQL
                    APIfetch: node_fetch_1.default,
                    // TO-DO: Need to pass Auth headers to evaluator API calls
                    graphQLConnection: { fetch: node_fetch_1.default, endpoint: graphQLEndpoint },
                }));
            }
            evaluationIndexArray.push({ row: rowIndex, col: colIndex });
            return 'Awaiting promise...';
        });
        return { id: record.id, rowValues: thisRow, item: {} };
    });
    const resolvedValues = yield Promise.all(evaluationPromiseArray);
    // Replace evaluated values in table structure
    resolvedValues.forEach((value, index) => {
        const { row, col } = evaluationIndexArray[index];
        tableRows[row].rowValues[col] = value;
    });
    // Also provide a version of the row/item in Object form, just because
    tableRows.forEach((row) => {
        const item = {};
        columnDefinitionMasterList.forEach(({ columnName }, index) => (item[columnName] = row.rowValues[index]));
        row.item = item;
    });
    return { tableName, title, code, headerRow, tableRows, totalCount };
});
exports.constructDetailsResponse = (tableName, tableTitle, columnDefinitionMasterList, headerDefinition, fetchedRecord, linkedApplications) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d, _e, _f, _g;
    const id = fetchedRecord.id;
    const columns = columnDefinitionMasterList.map(({ columnName }) => columnName);
    // Build display definitions object
    const displayDefinitions = columnDefinitionMasterList.reduce((displayDef, { columnName, isBasicField, dataType, columnDefinition = {} }) => {
        const { title, elementTypePluginCode, elementParameters, additionalFormatting } = columnDefinition;
        displayDef[columnName] = {
            title: title !== null && title !== void 0 ? title : lodash_1.startCase(columnName),
            isBasicField,
            dataType,
            formatting: Object.assign({ elementTypePluginCode: elementTypePluginCode || undefined, elementParameters: elementParameters || undefined }, additionalFormatting),
        };
        return displayDef;
    }, {});
    // Build item, keeping unresolved Promises in separate array (as above)
    const evaluationPromiseArray = [];
    const evaluationFieldArray = [];
    const item = columnDefinitionMasterList.reduce((obj, { columnName, isBasicField, columnDefinition }) => {
        var _a;
        if (isBasicField && !(columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression))
            obj[columnName] = fetchedRecord[columnName];
        else if (!(columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression))
            obj[columnName] = 'Field not defined';
        else {
            evaluationPromiseArray.push(expression_evaluator_1.default((_a = columnDefinition === null || columnDefinition === void 0 ? void 0 : columnDefinition.valueExpression) !== null && _a !== void 0 ? _a : {}, {
                objects: Object.assign(Object.assign({}, fetchedRecord), { thisField: fetchedRecord[columnName] }),
                // pgConnection: DBConnect, probably don't want to allow SQL
                APIfetch: node_fetch_1.default,
                // TO-DO: Need to pass Auth headers to evaluator API calls
                graphQLConnection: { fetch: node_fetch_1.default, endpoint: graphQLEndpoint },
            }));
            obj[columnName] = 'Awaiting promise...';
            evaluationFieldArray.push(columnName);
        }
        return obj;
    }, {});
    // Build header
    const header = {
        value: null,
        columnName: headerDefinition.columnName,
        isBasicField: headerDefinition.isBasicField,
        dataType: headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.dataType,
        formatting: Object.assign({ elementTypePluginCode: ((_b = headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.columnDefinition) === null || _b === void 0 ? void 0 : _b.elementTypePluginCode) || undefined, elementParameters: ((_c = headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.columnDefinition) === null || _c === void 0 ? void 0 : _c.elementParameters) || undefined }, (_d = headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.columnDefinition) === null || _d === void 0 ? void 0 : _d.additionalFormatting),
    };
    if (headerDefinition.isBasicField)
        header.value = fetchedRecord[headerDefinition.columnName];
    else if (!((_e = headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.columnDefinition) === null || _e === void 0 ? void 0 : _e.valueExpression))
        header.value = 'Field not defined';
    else {
        evaluationPromiseArray.push(expression_evaluator_1.default((_g = (_f = headerDefinition === null || headerDefinition === void 0 ? void 0 : headerDefinition.columnDefinition) === null || _f === void 0 ? void 0 : _f.valueExpression) !== null && _g !== void 0 ? _g : {}, {
            objects: Object.assign(Object.assign({}, fetchedRecord), { thisField: fetchedRecord[headerDefinition.columnName] }),
            // pgConnection: DBConnect, probably don't want to allow SQL
            APIfetch: node_fetch_1.default,
            // TO-DO: Need to pass Auth headers to evaluator API calls
            graphQLConnection: { fetch: node_fetch_1.default, endpoint: graphQLEndpoint },
        }));
        evaluationFieldArray.push('HEADER');
    }
    const resolvedValues = yield Promise.all(evaluationPromiseArray);
    // Replace evaluated values in item
    resolvedValues.forEach((value, index) => {
        const field = evaluationFieldArray[index];
        if (field === 'HEADER')
            header.value = value;
        else
            item[field] = value;
    });
    return {
        tableName,
        tableTitle,
        id,
        header,
        columns,
        displayDefinitions,
        item,
        linkedApplications,
    };
});
//# sourceMappingURL=helpers.js.map