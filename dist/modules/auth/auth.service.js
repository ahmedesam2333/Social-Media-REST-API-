"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_model_js_1 = require("../../DB/models/User.model.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const error_response_js_1 = require("../../utils/response/error.response.js");
const hash_security_js_1 = require("../../utils/security/hash.security.js");
const email_event_js_1 = require("../../utils/event/email.event.js");
const otp_js_1 = __importDefault(require("../../utils/otp.js"));
const token_security_js_1 = require("../../utils/security/token.security.js");
class AuthenticationService {
    userModel = new user_repository_js_1.UserRepository(User_model_js_1.UserModel);
    constructor() { }
    signup = async (req, res) => {
        const { username, email, password } = req.body;
        const UserExist = await this.userModel.findOne({
            filter: { email },
            select: "email",
            options: {
                lean: true,
            },
        });
        if (UserExist)
            throw new error_response_js_1.ConflictException("Email Existed");
        const { otp, hashedOtp } = await (0, otp_js_1.default)();
        await this.userModel.createUser({
            data: [
                {
                    username,
                    email,
                    password: await (0, hash_security_js_1.generateHash)(password),
                    confirmEmailOtp: hashedOtp,
                },
            ],
        });
        email_event_js_1.emailEvent.emit("confirmEmail", { to: email, otp });
        return res
            .status(201)
            .json({ message: "PLease check your Email for Verification" });
    };
    login = async (req, res) => {
        const { email, password } = req.body;
        const user = await this.userModel.findOne({
            filter: { email, confirmedAt: { $exists: true } },
        });
        if (!user || !(await (0, hash_security_js_1.compareHash)(password, user.password)))
            throw new error_response_js_1.NotFoundException("Invalid Email or Password or the Email not Verified");
        const Credentials = await (0, token_security_js_1.createLoginCredentials)(user);
        return res.json({
            message: "User Logged In Successfully",
            data: { Credentials },
        });
    };
    confirmEmail = async (req, res) => {
        const { email, otp } = req.body;
        const user = await this.userModel.findOne({
            filter: {
                email,
                confirmedAt: { $exists: false },
                confirmEmailOtp: { $exists: true },
            },
        });
        if (!user)
            throw new error_response_js_1.NotFoundException("Invalid Email or Already Confirmed");
        if (!(await (0, hash_security_js_1.compareHash)(otp, user.confirmEmailOtp)))
            throw new error_response_js_1.BadRequestException("Invalid OTP");
        await this.userModel.updateOne({
            filter: { _id: user._id },
            update: {
                $set: {
                    confirmedAt: Date.now(),
                },
                $unset: {
                    confirmEmailOtp: 1,
                },
            },
        });
        return res.json({
            message: "Email Verified Successfully Now you can login",
        });
    };
}
exports.default = new AuthenticationService();
