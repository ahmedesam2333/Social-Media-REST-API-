"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = require("nodemailer");
const error_response_js_1 = require("../response/error.response.js");
const sendEmail = async (data) => {
    if (!data.html && !data.attachments?.length && !data.text)
        throw new error_response_js_1.BadRequestException("Missing Email Content");
    const transporter = (0, nodemailer_1.createTransport)({
        service: "gmail",
        auth: {
            user: process.env.APP_EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });
    const info = await transporter.sendMail({
        ...data,
        from: `"Social App Team" <${process.env.APP_EMAIL}>`,
        replyTo: process.env.APP_EMAIL,
    });
};
exports.sendEmail = sendEmail;
