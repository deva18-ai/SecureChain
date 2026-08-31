"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.willRunWithTypescript = willRunWithTypescript;
exports.isRunningWithTypescript = isRunningWithTypescript;
exports.isTypescriptSupported = isTypescriptSupported;
exports.loadTsNode = loadTsNode;
exports.isTypescriptFile = isTypescriptFile;
exports.isJavascriptFile = isJavascriptFile;
const config_loading_1 = require("./config/config-loading");
const errors_1 = require("./errors");
const errors_list_1 = require("./errors-list");
const execution_mode_1 = require("./execution-mode");
let cachedIsTypescriptSupported;
/**
 * Returns true if Hardhat will run in using typescript mode.
 * @param configPath The config path if provider by the user.
 */
function willRunWithTypescript(configPath) {
    const config = (0, config_loading_1.resolveConfigPath)(configPath);
    return isNonEsmTypescriptFile(config);
}
/**
 * Returns true if a Hardhat is already running with typescript.
 */
function isRunningWithTypescript(config) {
    return isNonEsmTypescriptFile(config.paths.configFile);
}
function isTypescriptSupported() {
    if (cachedIsTypescriptSupported === undefined) {
        try {
            // We resolve these from Hardhat's installation.
            require.resolve("typescript");
            require.resolve("ts-node");
            cachedIsTypescriptSupported = true;
        }
        catch {
            cachedIsTypescriptSupported = false;
        }
    }
    return cachedIsTypescriptSupported;
}
function loadTsNode(tsConfigPath, shouldTypecheck = false) {
    try {
        require.resolve("typescript");
    }
    catch {
        throw new errors_1.HardhatError(errors_list_1.ERRORS.GENERAL.TYPESCRIPT_NOT_INSTALLED);
    }
    try {
        require.resolve("ts-node");
    }
    catch {
        throw new errors_1.HardhatError(errors_list_1.ERRORS.GENERAL.TS_NODE_NOT_INSTALLED);
    }
    // If we are running tests we just want to transpile
    if ((0, execution_mode_1.isRunningHardhatCoreTests)()) {
        // eslint-disable-next-line import/no-extraneous-dependencies
        require("ts-node/register/transpile-only");
        return;
    }
    if (tsConfigPath !== undefined) {
        process.env.TS_NODE_PROJECT = tsConfigPath;
    }
    // See: https://github.com/nomiclabs/hardhat/issues/265
    if (process.env.TS_NODE_FILES === undefined) {
        process.env.TS_NODE_FILES = "true";
    }
    let tsNodeRequirement = "ts-node/register";
    if (!shouldTypecheck) {
        tsNodeRequirement += "/transpile-only";
    }
    // eslint-disable-next-line import/no-extraneous-dependencies
    require(tsNodeRequirement);
}
function isNonEsmTypescriptFile(path) {
    return /\.(ts|cts)$/i.test(path);
}
function isTypescriptFile(path) {
    return /\.(ts|cts|mts)$/i.test(path);
}
function isJavascriptFile(path) {
    return /\.(js|cjs|mjs)$/i.test(path);
}
//# sourceMappingURL=typescript-support.js.map