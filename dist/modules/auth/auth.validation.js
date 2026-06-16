"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = exports.login = void 0;
const zod_1 = require("zod");
const validation_middleware_js_1 = require("../../middleware/validation.middleware.js");
exports.login = {
    body: zod_1.z.strictObject({
        email: validation_middleware_js_1.generalFields.email,
        password: validation_middleware_js_1.generalFields.password,
    }),
};
exports.signup = {
    body: exports.login.body
        .extend({
        username: validation_middleware_js_1.generalFields.username,
        phone: validation_middleware_js_1.generalFields.phone,
    })
        .superRefine((data, ctx) => {
        if (data.username.split(" ").length !== 2) {
            ctx.addIssue({
                code: "custom",
                path: ["username"],
                message: "User Name must contain 2 parts first name and last name like example: John Doe",
            });
        }
    }),
};
