"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = void 0;
const zod_1 = require("zod");
exports.signup = {
    body: zod_1.z.strictObject({
        username: zod_1.z.string().min(3).max(20),
        email: zod_1.z.email(),
        password: zod_1.z
            .string()
            .regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$")),
        phone: zod_1.z.string().regex(new RegExp("^01[0125][0-9]{8}$")),
    }),
};
