"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskProfile = createTaskProfile;
exports.completeTaskProfile = completeTaskProfile;
exports.createParentTaskProfile = createParentTaskProfile;
exports.flagParallelChildren = flagParallelChildren;
function createTaskProfile(name) {
    return {
        name,
        start: process.hrtime.bigint(),
        children: [],
    };
}
function completeTaskProfile(taskProfile) {
    taskProfile.end = process.hrtime.bigint();
}
function createParentTaskProfile(taskProfile) {
    return createTaskProfile(`super::${taskProfile.name}`);
}
/**
 * Sets `parallel` to `true` to any children that was running at the same time
 * of another.
 *
 * We assume `children[]` is in chronological `start` order.
 */
function flagParallelChildren(profile, isParentParallel = false) {
    if (isParentParallel) {
        profile.parallel = true;
        for (const child of profile.children) {
            child.parallel = true;
        }
    }
    else {
        for (const [i, child] of profile.children.entries()) {
            if (i === 0) {
                continue;
            }
            const prevChild = profile.children[i - 1];
            if (child.start < prevChild.end) {
                prevChild.parallel = true;
                child.parallel = true;
            }
        }
    }
    for (const child of profile.children) {
        flagParallelChildren(child, child.parallel);
    }
}
//# sourceMappingURL=task-profiling.js.map