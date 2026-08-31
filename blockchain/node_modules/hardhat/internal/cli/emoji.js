"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableEmoji = enableEmoji;
exports.emoji = emoji;
let emojiEnabled = false;
function enableEmoji() {
    emojiEnabled = true;
}
function emoji(msgIfEnabled, msgIfDisabled = "") {
    return emojiEnabled ? msgIfEnabled : msgIfDisabled;
}
//# sourceMappingURL=emoji.js.map