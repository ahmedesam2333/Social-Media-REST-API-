"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const User_model_js_1 = require("../../DB/models/User.model.js");
const token_security_js_1 = require("../../utils/security/token.security.js");
const s3_config_js_1 = require("../../utils/multer/s3.config.js");
class UserService {
    userModel = new user_repository_js_1.UserRepository(User_model_js_1.UserModel);
    constructor() { }
    profile = async (req, res) => {
        return res.json({
            message: "Done",
            data: {
                user: req.user,
                decoded: req.decoded,
            },
        });
    };
    profileImage = async (req, res) => {
        const key = await (0, s3_config_js_1.uploadFile)({
            file: req.file,
            path: `users/${req.decoded?._id}`,
        });
        return res.json({ message: "Done", data: { key } });
    };
    logout = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_security_js_1.LogoutEnum.all:
                update.changeCredentialsTime = new Date();
                break;
            default:
                await (0, token_security_js_1.createRevokedToken)(req.decoded);
                statusCode = 201;
        }
        await this.userModel.updateOne({
            filter: {
                _id: req.decoded?._id,
            },
            update,
        });
        return res.status(statusCode).json({
            message: "Done",
        });
    };
    refreshToken = async (req, res) => {
        const credentials = await (0, token_security_js_1.createLoginCredentials)(req.user);
        await (0, token_security_js_1.createRevokedToken)(req.decoded);
        return res.status(201).json({
            message: "Done",
            data: {
                credentials,
            },
        });
    };
}
exports.default = new UserService();
