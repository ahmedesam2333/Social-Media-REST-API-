"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalFields = exports.validation = void 0;
const zod_1 = require("zod");
const error_response_js_1 = require("../utils/response/error.response.js");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (let key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResult = schema[key].safeParse(req[key]);
            if (!validationResult.success) {
                const errors = validationResult.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path[0] };
                    }),
                });
            }
        }
        if (validationErrors.length) {
            throw new error_response_js_1.BadRequestException("Validation Error", { validationErrors });
        }
        return next();
    };
};
exports.validation = validation;
exports.generalFields = {
    email: zod_1.z.email(),
    password: zod_1.z
        .string()
        .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
    username: zod_1.z
        .string({ error: "User Name is required" })
        .min(3, { error: "User Name must be at least 3 characters" })
        .max(20, { error: "User Name must be at most 20 characters" }),
    phone: zod_1.z.string().regex(new RegExp("^01[0125][0-9]{8}$")),
    otp: zod_1.z.string().regex(/^\d{6}$/),
};
