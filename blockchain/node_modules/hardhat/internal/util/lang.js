"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromEntries = fromEntries;
exports.mapValues = mapValues;
function fromEntries(entries) {
    return Object.assign({}, ...entries.map(([name, value]) => ({
        [name]: value,
    })));
}
function mapValues(o, callback) {
    const result = {};
    for (const [key, value] of Object.entries(o)) {
        result[key] = callback(value);
    }
    return result;
}
//# sourceMappingURL=lang.js.map