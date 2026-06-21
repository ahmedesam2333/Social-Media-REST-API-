"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = void 0;
const hash_security_js_1 = require("./security/hash.security.js");
const generateOtp = async () => {
    const otp = Math.floor(Math.random() * (999_999 - 100_000 + 1) + 100_000);
    const hashedOtp = await (0, hash_security_js_1.generateHash)(String(otp));
    return { otp, hashedOtp };
};
exports.generateOtp = generateOtp;
exports.default = exports.generateOtp;
