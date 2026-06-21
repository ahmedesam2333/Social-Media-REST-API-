"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const token_security_js_1 = require("../utils/security/token.security.js");
const error_response_js_1 = require("../utils/response/error.response.js");
const authentication = () => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_js_1.BadRequestException("Validation Error", {
                key: "headers",
                issues: [
                    { path: "authorization" },
                    { message: "missing authorization" },
                ],
            });
        }
        const { user, decoded } = await (0, token_security_js_1.decodeToken)({
            authorization: req.headers.authorization,
        });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
