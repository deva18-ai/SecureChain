"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateString = parseDateString;
exports.dateToTimestampSeconds = dateToTimestampSeconds;
exports.timestampSecondsToDate = timestampSecondsToDate;
exports.getDifferenceInSeconds = getDifferenceInSeconds;
function parseDateString(str) {
    return new Date(str);
}
function dateToTimestampSeconds(date) {
    return Math.floor(date.valueOf() / 1000);
}
function timestampSecondsToDate(timestamp) {
    return new Date(timestamp * 1000);
}
function getDifferenceInSeconds(a, b) {
    return Math.floor((a.valueOf() - b.valueOf()) / 1000);
}
//# sourceMappingURL=date.js.map