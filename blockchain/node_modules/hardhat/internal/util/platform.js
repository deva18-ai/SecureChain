"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequireCachedFiles = getRequireCachedFiles;
function getRequireCachedFiles() {
    return Object.keys(require.cache).filter((p) => !p.startsWith("internal") && (p.endsWith(".js") || p.endsWith(".ts")));
}
//# sourceMappingURL=platform.js.map