"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTaskIdentifier = parseTaskIdentifier;
function parseTaskIdentifier(taskIdentifier) {
    if (typeof taskIdentifier === "string") {
        return {
            scope: undefined,
            task: taskIdentifier,
        };
    }
    else {
        return {
            scope: taskIdentifier.scope,
            task: taskIdentifier.task,
        };
    }
}
//# sourceMappingURL=util.js.map