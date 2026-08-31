"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackageJsonPath = getPackageJsonPath;
exports.getPackageRoot = getPackageRoot;
exports.findClosestPackageJson = findClosestPackageJson;
exports.getPackageName = getPackageName;
exports.getPackageJson = getPackageJson;
exports.getHardhatVersion = getHardhatVersion;
exports.getProjectPackageJson = getProjectPackageJson;
const find_up_1 = __importDefault(require("find-up"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const errors_1 = require("../core/errors");
function getPackageJsonPath() {
    return findClosestPackageJson(__filename);
}
function getPackageRoot() {
    const packageJsonPath = getPackageJsonPath();
    return path_1.default.dirname(packageJsonPath);
}
function findClosestPackageJson(file) {
    return find_up_1.default.sync("package.json", { cwd: path_1.default.dirname(file) });
}
async function getPackageName(file) {
    const packageJsonPath = findClosestPackageJson(file);
    if (packageJsonPath !== undefined && packageJsonPath !== "") {
        const packageJson = await fs_extra_1.default.readJSON(packageJsonPath);
        return packageJson.name;
    }
    return "";
}
async function getPackageJson() {
    const root = getPackageRoot();
    return fs_extra_1.default.readJSON(path_1.default.join(root, "package.json"));
}
function getHardhatVersion() {
    const packageJsonPath = findClosestPackageJson(__filename);
    (0, errors_1.assertHardhatInvariant)(packageJsonPath !== undefined, "There should be a package.json in hardhat-core's root directory");
    const packageJson = fs_extra_1.default.readJsonSync(packageJsonPath);
    return packageJson.version;
}
/**
 * Return the contents of the package.json in the user's project
 */
function getProjectPackageJson() {
    const packageJsonPath = find_up_1.default.sync("package.json");
    (0, errors_1.assertHardhatInvariant)(packageJsonPath !== undefined, "Expected a package.json file in the current directory or in an ancestor directory");
    return fs_extra_1.default.readJson(packageJsonPath);
}
//# sourceMappingURL=packageInfo.js.map