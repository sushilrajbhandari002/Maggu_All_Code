"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpError = void 0;
exports.notFound = notFound;
exports.errorHandler = errorHandler;
class HttpError extends Error {
    constructor(statusCode, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
    }
}
exports.HttpError = HttpError;
// 404 handler
function notFound(req, res) {
    res.status(404).json({ message: 'Not Found' });
}
// Central error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, _next) {
    console.error(err);
    if (err instanceof HttpError) {
        return res
            .status(err.statusCode)
            .json({ message: err.message, details: err.details });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
}
//# sourceMappingURL=errorHandler.js.map