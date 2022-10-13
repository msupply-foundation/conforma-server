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
exports.getAdminJWT = exports.getTokenData = exports.getUserInfo = exports.extractJWTfromHeader = void 0;
const databaseConnect_1 = __importDefault(require("../databaseConnect"));
const config_1 = __importDefault(require("../../config"));
const jsonwebtoken_1 = require("jsonwebtoken");
const util_1 = require("util");
const nanoid_1 = require("nanoid");
const rowLevelPolicyHelpers_1 = require("./rowLevelPolicyHelpers");
const verifyPromise = util_1.promisify(jsonwebtoken_1.verify);
const signPromise = util_1.promisify(jsonwebtoken_1.sign);
const extractJWTfromHeader = (request) => { var _a; return (((_a = request === null || request === void 0 ? void 0 : request.headers) === null || _a === void 0 ? void 0 : _a.authorization) || '').replace('Bearer ', ''); };
exports.extractJWTfromHeader = extractJWTfromHeader;
const getTokenData = (jwtToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield verifyPromise(jwtToken, config_1.default.jwtSecret);
        return data;
    }
    catch (err) {
        console.log('Cannot parse JWT');
        return { error: err.message };
    }
});
exports.getTokenData = getTokenData;
const getUserInfo = (userOrgParameters) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, userId, orgId, sessionId } = userOrgParameters;
    const userOrgData = yield databaseConnect_1.default.getUserOrgData({
        userId,
        username,
    });
    const { userId: newUserId, username: newUsername, firstName, lastName, email, dateOfBirth, } = userOrgData === null || userOrgData === void 0 ? void 0 : userOrgData[0];
    const orgList = userOrgData
        .filter((item) => item.orgId)
        .map(({ orgId, orgName, userRole, registration, address, logoUrl, isSystemOrg }) => {
        // Destructuring extracts only the relevant fields
        return { orgId, orgName, userRole, registration, address, logoUrl, isSystemOrg };
    });
    const templatePermissionRows = yield databaseConnect_1.default.getUserTemplatePermissions(newUsername, orgId || null, true);
    // Also get org-only permissions
    if (orgId)
        templatePermissionRows.push(...(yield databaseConnect_1.default.getOrgTemplatePermissions(orgId)));
    const selectedOrg = orgId ? orgList.filter((org) => org.orgId === orgId) : undefined;
    const returnSessionId = sessionId !== null && sessionId !== void 0 ? sessionId : nanoid_1.nanoid(16);
    const isAdmin = !!templatePermissionRows.find((row) => !!(row === null || row === void 0 ? void 0 : row.isAdmin));
    return {
        templatePermissions: buildTemplatePermissions(templatePermissionRows),
        permissionNames: Array.from(new Set(templatePermissionRows.map(({ permissionName }) => permissionName))),
        JWT: yield getSignedJWT({
            userId: userId || newUserId,
            orgId,
            templatePermissionRows,
            sessionId: returnSessionId,
            isAdmin,
        }),
        user: {
            userId: userId || newUserId,
            username: username || newUsername,
            firstName,
            lastName,
            email,
            dateOfBirth,
            organisation: selectedOrg === null || selectedOrg === void 0 ? void 0 : selectedOrg[0],
            sessionId: returnSessionId,
        },
        isAdmin,
        orgList,
    };
});
exports.getUserInfo = getUserInfo;
const buildTemplatePermissions = (templatePermissionRows) => {
    const templatePermissions = {};
    templatePermissionRows.forEach(({ permissionType, templateCode }) => {
        if (!templateCode || !permissionType)
            return;
        if (!templatePermissions[templateCode])
            templatePermissions[templateCode] = [];
        if (templatePermissions[templateCode].includes(permissionType))
            return;
        templatePermissions[templateCode].push(permissionType);
    });
    return templatePermissions;
};
const getSignedJWT = (JWTelements) => __awaiter(void 0, void 0, void 0, function* () {
    return yield signPromise(rowLevelPolicyHelpers_1.compileJWT(JWTelements), config_1.default.jwtSecret);
});
const getAdminJWT = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield signPromise(Object.assign(Object.assign({}, rowLevelPolicyHelpers_1.baseJWT), { isAdmin: true, role: 'postgres' }), config_1.default.jwtSecret);
});
exports.getAdminJWT = getAdminJWT;
//# sourceMappingURL=loginHelpers.js.map