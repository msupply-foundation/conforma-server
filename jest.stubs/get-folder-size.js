// Jest stub for the ESM-only "get-folder-size" package, which Jest (CJS)
// cannot parse. Mapped via moduleNameMapper in jest.config.js. Folder sizes
// are irrelevant in tests, so all variants report zero.
const getFolderSize = async () => ({ size: 0, errors: null })
getFolderSize.loose = async () => 0
getFolderSize.strict = async () => 0

module.exports = getFolderSize
module.exports.default = getFolderSize
