"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.min = min;
exports.max = max;
exports.isBigInt = isBigInt;
exports.divUp = divUp;
exports.cmp = cmp;
exports.toEvmWord = toEvmWord;
exports.fromBigIntLike = fromBigIntLike;
exports.toHex = toHex;
const errors_1 = require("../core/errors");
function min(x, y) {
    return x < y ? x : y;
}
function max(x, y) {
    return x > y ? x : y;
}
function isBigInt(x) {
    return typeof x === "bigint";
}
function divUp(x, y) {
    let result = x / y;
    if (x % y !== 0n) {
        result = result + 1n;
    }
    return result;
}
function cmp(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}
/**
 * Converts the number to a hexadecimal string with a length of 32
 * bytes. This hex string is NOT 0x-prefixed.
 */
function toEvmWord(x) {
    return x.toString(16).padStart(64, "0");
}
function bufferToBigInt(x) {
    const hex = `0x${Buffer.from(x).toString("hex")}`;
    return hex === "0x" ? 0n : BigInt(hex);
}
function fromBigIntLike(x) {
    if (x === undefined || typeof x === "bigint") {
        return x;
    }
    if (typeof x === "number" || typeof x === "string") {
        return BigInt(x);
    }
    if (x instanceof Uint8Array) {
        return bufferToBigInt(x);
    }
    const exhaustiveCheck = x;
    return exhaustiveCheck;
}
function toHex(x) {
    (0, errors_1.assertHardhatInvariant)(x >= 0, `toHex can only be used with non-negative numbers, but received ${x}`);
    return `0x${x.toString(16)}`;
}
//# sourceMappingURL=bigint.js.map