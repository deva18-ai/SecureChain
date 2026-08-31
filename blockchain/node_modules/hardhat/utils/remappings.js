"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyRemappings = applyRemappings;
function applyRemappings(remappings, sourceName) {
    const selectedRemapping = { from: "", to: "" };
    for (const [from, to] of Object.entries(remappings)) {
        if (sourceName.startsWith(from) &&
            from.length >= selectedRemapping.from.length) {
            [selectedRemapping.from, selectedRemapping.to] = [from, to];
        }
    }
    return sourceName.replace(selectedRemapping.from, selectedRemapping.to);
}
//# sourceMappingURL=remappings.js.map