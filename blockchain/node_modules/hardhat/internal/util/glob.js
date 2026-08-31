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
exports.glob = glob;
exports.globSync = globSync;
const path = __importStar(require("path"));
/**
 * DO NOT USE THIS FUNCTION. It's SLOW and its semantics are optimized for
 * user-facing CLI globs, not traversing the FS.
 *
 * It's not removed because unfortunately some plugins used it, like the truffle
 * ones.
 *
 * @deprecated
 */
async function glob(pattern, options = {}) {
    const files = await (await Promise.resolve().then(() => __importStar(require("tinyglobby")))).glob([pattern], options);
    return files.map(path.normalize);
}
/**
 * @deprecated
 * @see glob
 */
function globSync(pattern, options = {}) {
    const files = require("tinyglobby").globSync([pattern], options);
    return files.map(path.normalize);
}
//# sourceMappingURL=glob.js.map