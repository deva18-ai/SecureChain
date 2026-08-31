"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonResponse = parseJsonResponse;
exports.isValidJsonRequest = isValidJsonRequest;
exports.isValidJsonResponse = isValidJsonResponse;
exports.isSuccessfulJsonResponse = isSuccessfulJsonResponse;
const errors_1 = require("../core/errors");
const errors_list_1 = require("../core/errors-list");
function parseJsonResponse(text) {
    try {
        const json = JSON.parse(text);
        const responses = Array.isArray(json) ? json : [json];
        for (const response of responses) {
            if (!isValidJsonResponse(response)) {
                // We are sending the proper error inside the catch part of the statement.
                // We just need to raise anything here.
                // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
                throw new Error();
            }
        }
        return json;
    }
    catch {
        throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.INVALID_JSON_RESPONSE, {
            response: text,
        });
    }
}
function isValidJsonRequest(payload) {
    if (payload.jsonrpc !== "2.0") {
        return false;
    }
    if (typeof payload.id !== "number" && typeof payload.id !== "string") {
        return false;
    }
    if (typeof payload.method !== "string") {
        return false;
    }
    if (payload.params !== undefined && !Array.isArray(payload.params)) {
        return false;
    }
    return true;
}
function isValidJsonResponse(payload) {
    if (payload.jsonrpc !== "2.0") {
        return false;
    }
    if (typeof payload.id !== "number" &&
        typeof payload.id !== "string" &&
        payload.id !== null) {
        return false;
    }
    if (payload.id === null && payload.error === undefined) {
        return false;
    }
    if (payload.result === undefined && payload.error === undefined) {
        return false;
    }
    if (payload.error !== undefined) {
        if (typeof payload.error.code !== "number") {
            return false;
        }
        if (typeof payload.error.message !== "string") {
            return false;
        }
    }
    return true;
}
function isSuccessfulJsonResponse(payload) {
    return "result" in payload;
}
//# sourceMappingURL=jsonrpc.js.map