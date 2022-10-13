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
exports.deleteFile = exports.filesPath = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fsPromises = fs_1.default.promises;
const config_1 = __importDefault(require("../../config"));
const utilityFunctions_1 = require("../utilityFunctions");
const { filesFolder, genericThumbnailsFolderName } = config_1.default;
exports.filesPath = path_1.default.join(utilityFunctions_1.getAppEntryPointDir(), filesFolder);
exports.deleteFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const { filePath, thumbnailPath, originalFilename } = file;
    try {
        yield fsPromises.unlink(path_1.default.join(exports.filesPath, filePath));
        // Don't delete generic (shared) thumbnail files
        if (!thumbnailPath.match(genericThumbnailsFolderName))
            yield fsPromises.unlink(path_1.default.join(exports.filesPath, thumbnailPath));
        console.log(`File deleted: ${originalFilename}`);
        // Also delete folder if it's now empty
        const dir = path_1.default.dirname(filePath);
        if ((yield fsPromises.readdir(path_1.default.join(exports.filesPath, dir))).length === 0)
            yield fsPromises.rmdir(path_1.default.join(exports.filesPath, dir));
    }
    catch (err) {
        console.log(err);
    }
});
//# sourceMappingURL=deleteFiles.js.map