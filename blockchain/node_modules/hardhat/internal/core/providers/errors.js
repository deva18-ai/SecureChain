"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidResponseError = exports.MethodNotSupportedError = exports.TransactionExecutionError = exports.InvalidInputError = exports.InternalError = exports.InvalidArgumentsError = exports.MethodNotFoundError = exports.InvalidRequestError = exports.InvalidJsonInputError = exports.ProviderError = void 0;
const errors_1 = require("../errors");
// Codes taken from: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1474.md#error-codes
//
// Code	  Message	              Meaning	                            Category
//
// -32700	Parse error	          Invalid JSON	                      standard
// -32600	Invalid request	      JSON is not a valid request object  standard
// -32601	Method not found	    Method does not exist	              standard
// -32602	Invalid params	      Invalid method parameters	          standard
// -32603	Internal error	      Internal JSON-RPC error	            standard
// -32004	Method not supported	Method is not implemented	          non-standard
// -32000	Invalid input	        Missing or invalid parameters	      non-standard
// -32003	Transaction rejected	Transaction creation failed	        non-standard
//
//
// Non standard:
// -32999 Invalid response      The server returned a JSON-RPC      hardhat-specific
//                              response, but the result is not
//                              in the expected format
//
// Not implemented:
//
// -32001	Resource not found	  Requested resource not found	      non-standard
// -32002	Resource unavailable	Requested resource not available	  non-standard
class ProviderError extends errors_1.CustomError {
    parent;
    static isProviderError(other) {
        return (other !== undefined && other !== null && other._isProviderError === true);
    }
    code;
    data;
    _isProviderError;
    constructor(message, code, parent) {
        super(message, parent);
        this.parent = parent;
        this.code = code;
        this._isProviderError = true;
    }
}
exports.ProviderError = ProviderError;
class InvalidJsonInputError extends ProviderError {
    static CODE = -32700;
    constructor(message, parent) {
        super(message, InvalidJsonInputError.CODE, parent);
    }
}
exports.InvalidJsonInputError = InvalidJsonInputError;
class InvalidRequestError extends ProviderError {
    static CODE = -32600;
    constructor(message, parent) {
        super(message, InvalidRequestError.CODE, parent);
    }
}
exports.InvalidRequestError = InvalidRequestError;
class MethodNotFoundError extends ProviderError {
    static CODE = -32601;
    constructor(message, parent) {
        super(message, MethodNotFoundError.CODE, parent);
    }
}
exports.MethodNotFoundError = MethodNotFoundError;
class InvalidArgumentsError extends ProviderError {
    static CODE = -32602;
    constructor(message, parent) {
        super(message, InvalidArgumentsError.CODE, parent);
    }
}
exports.InvalidArgumentsError = InvalidArgumentsError;
class InternalError extends ProviderError {
    static CODE = -32603;
    constructor(message, parent) {
        super(message, InternalError.CODE, parent);
    }
}
exports.InternalError = InternalError;
class InvalidInputError extends ProviderError {
    static CODE = -32000;
    constructor(message, parent) {
        super(message, InvalidInputError.CODE, parent);
    }
}
exports.InvalidInputError = InvalidInputError;
class TransactionExecutionError extends ProviderError {
    static CODE = -32003;
    // TODO: This should have the transaction id
    // TODO: Normalize this constructor
    constructor(parentOrMsg) {
        if (typeof parentOrMsg === "string") {
            super(parentOrMsg, TransactionExecutionError.CODE);
        }
        else {
            super(parentOrMsg.message, TransactionExecutionError.CODE, parentOrMsg);
        }
    }
}
exports.TransactionExecutionError = TransactionExecutionError;
class MethodNotSupportedError extends ProviderError {
    static CODE = -32004;
    constructor(method, parent) {
        super(`Method ${method} is not supported`, MethodNotSupportedError.CODE, parent);
    }
}
exports.MethodNotSupportedError = MethodNotSupportedError;
class InvalidResponseError extends ProviderError {
    static CODE = -32999;
    constructor(message, parent) {
        super(message, InvalidResponseError.CODE, parent);
    }
}
exports.InvalidResponseError = InvalidResponseError;
//# sourceMappingURL=errors.js.map