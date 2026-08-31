"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.vars = exports.types = exports.internalTask = void 0;
exports.task = task;
exports.subtask = subtask;
exports.scope = scope;
exports.extendEnvironment = extendEnvironment;
exports.extendConfig = extendConfig;
exports.extendProvider = extendProvider;
const context_1 = require("../../context");
const errors_1 = require("../errors");
const errors_list_1 = require("../errors-list");
const argumentTypes = __importStar(require("../params/argumentTypes"));
function task(name, descriptionOrAction, action) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    const dsl = ctx.tasksDSL;
    if (descriptionOrAction === undefined) {
        return dsl.task(name);
    }
    if (typeof descriptionOrAction !== "string") {
        return dsl.task(name, descriptionOrAction);
    }
    return dsl.task(name, descriptionOrAction, action);
}
function subtask(name, descriptionOrAction, action) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    const dsl = ctx.tasksDSL;
    if (descriptionOrAction === undefined) {
        return dsl.subtask(name);
    }
    if (typeof descriptionOrAction !== "string") {
        return dsl.subtask(name, descriptionOrAction);
    }
    return dsl.subtask(name, descriptionOrAction, action);
}
// Backwards compatibility alias
exports.internalTask = subtask;
function scope(name, description) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    const dsl = ctx.tasksDSL;
    return dsl.scope(name, description);
}
exports.types = argumentTypes;
/**
 * Register an environment extender what will be run after the
 * Hardhat Runtime Environment is initialized.
 *
 * @param extender A function that receives the Hardhat Runtime
 * Environment.
 */
function extendEnvironment(extender) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    ctx.environmentExtenders.push(extender);
}
/**
 * Register a config extender what will be run after the
 * Hardhat Runtime Environment is initialized.
 *
 * @param extender A function that receives the resolved config
 * to be modified and the config provided by the user
 */
function extendConfig(extender) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    ctx.configExtenders.push(extender);
}
/**
 * Register a provider extender what will be run after the
 * Hardhat Runtime Environment is initialized.
 *
 * @param extender A function that receives the current provider
 * and returns a new one.
 */
function extendProvider(extender) {
    const ctx = context_1.HardhatContext.getHardhatContext();
    ctx.providerExtenders.push(extender);
}
/**
 * This object provides methods to interact with the configuration variables.
 */
exports.vars = {
    has: hasVar,
    get: getVar,
};
/**
 * Checks if a configuration variable exists.
 *
 * @remarks
 * This method, when used during setup (via `npx hardhat vars setup`), will mark the variable as optional.
 *
 * @param varName - The name of the variable to check.
 *
 * @returns `true` if the variable exists, `false` otherwise.
 */
function hasVar(varName) {
    // varsManager will be an instance of VarsManager or VarsManagerSetup depending on the context (vars setup mode or not)
    return context_1.HardhatContext.getHardhatContext().varsManager.has(varName, true);
}
/**
 * Gets the value of the given configuration variable.
 *
 * @remarks
 * This method, when used during setup (via `npx hardhat vars setup`), will mark the variable as required,
 * unless a default value is provided.
 *
 * @param varName - The name of the variable to retrieve.
 * @param [defaultValue] - An optional default value to return if the variable does not exist.
 *
 * @returns The value of the configuration variable if it exists, or the default value if provided.
 *
 * @throws HH1201 if the variable does not exist and no default value is set.
 */
function getVar(varName, defaultValue) {
    // varsManager will be an instance of VarsManager or VarsManagerSetup depending on the context (vars setup mode or not)
    const value = context_1.HardhatContext.getHardhatContext().varsManager.get(varName, defaultValue, true);
    if (value !== undefined)
        return value;
    throw new errors_1.HardhatError(errors_list_1.ERRORS.VARS.VALUE_NOT_FOUND_FOR_VAR, {
        value: varName,
    });
}
//# sourceMappingURL=config-env.js.map