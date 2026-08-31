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
exports.optionalOrNullable = optionalOrNullable;
exports.optional = optional;
exports.nullable = nullable;
const t = __importStar(require("io-ts"));
function optionalOrNullable(codec, name = `${codec.name} | undefined`) {
    return new t.Type(name, (u) => u === undefined || codec.is(u), (i, c) => {
        if (i === undefined || i === null) {
            return t.success(undefined);
        }
        return codec.validate(i, c);
    }, (a) => {
        if (a === undefined) {
            return undefined;
        }
        return codec.encode(a);
    });
}
function optional(codec, name = `${codec.name} | undefined`) {
    return new t.Type(name, (u) => u === undefined || codec.is(u), (u, c) => (u === undefined ? t.success(undefined) : codec.validate(u, c)), (a) => (a === undefined ? undefined : codec.encode(a)));
}
function nullable(codec, name = `${codec.name} | null`) {
    return new t.Type(name, (u) => u === null || codec.is(u), (u, c) => (u === null ? t.success(null) : codec.validate(u, c)), (a) => (a === null ? null : codec.encode(a)));
}
//# sourceMappingURL=io-ts.js.map