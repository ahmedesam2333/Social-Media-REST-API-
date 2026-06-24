"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRevokedToken = exports.decodeToken = exports.createLoginCredentials = exports.getSignatures = exports.detectSignatureLevel = exports.generateToken = exports.verifyToken = exports.LogoutEnum = exports.TokenEnum = exports.SignatureLevelEnum = void 0;
const uuid_1 = require("uuid");
const jsonwebtoken_1 = require("jsonwebtoken");
const User_model_js_1 = require("../../DB/models/User.model.js");
const error_response_js_1 = require("../response/error.response.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
const token_repository_js_1 = require("../../DB/repository/token.repository.js");
const Token_model_js_1 = require("../../DB/models/Token.model.js");
var SignatureLevelEnum;
(function (SignatureLevelEnum) {
    SignatureLevelEnum["Bearer"] = "Bearer";
    SignatureLevelEnum["System"] = "System";
})(SignatureLevelEnum || (exports.SignatureLevelEnum = SignatureLevelEnum = {}));
var TokenEnum;
(function (TokenEnum) {
    TokenEnum["access"] = "access";
    TokenEnum["refresh"] = "refresh";
})(TokenEnum || (exports.TokenEnum = TokenEnum = {}));
var LogoutEnum;
(function (LogoutEnum) {
    LogoutEnum["only"] = "only";
    LogoutEnum["all"] = "all";
})(LogoutEnum || (exports.LogoutEnum = LogoutEnum = {}));
const verifyToken = async ({ token, secretKey = process.env.JWT_ACCESS_USER_KEY, }) => {
    return (0, jsonwebtoken_1.verify)(token, secretKey);
};
exports.verifyToken = verifyToken;
const generateToken = async ({ payload, secretKey = process.env.JWT_ACCESS_USER_KEY, options = { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) }, }) => {
    return (0, jsonwebtoken_1.sign)(payload, secretKey, options);
};
exports.generateToken = generateToken;
const detectSignatureLevel = async (role = User_model_js_1.RoleEnum.user) => {
    let signatureLevel = SignatureLevelEnum.Bearer;
    switch (role) {
        case User_model_js_1.RoleEnum.admin:
            signatureLevel;
            SignatureLevelEnum.System;
            break;
        default:
            signatureLevel = SignatureLevelEnum.Bearer;
    }
    return signatureLevel;
};
exports.detectSignatureLevel = detectSignatureLevel;
const getSignatures = async (signatureLevel = SignatureLevelEnum.Bearer) => {
    let signatures = {
        access_signature: "",
        refresh_signature: "",
    };
    switch (signatureLevel) {
        case SignatureLevelEnum.System:
            signatures.access_signature = process.env.JWT_ACCESS_ADMIN_KEY;
            signatures.refresh_signature = process.env
                .JWT_REFRESH_ADMIN_KEY;
            break;
        default:
            signatures.access_signature = process.env.JWT_ACCESS_USER_KEY;
            signatures.refresh_signature = process.env.JWT_REFRESH_USER_KEY;
    }
    return signatures;
};
exports.getSignatures = getSignatures;
const createLoginCredentials = async (user) => {
    const signatureLevel = await (0, exports.detectSignatureLevel)(user.role);
    const signatures = await (0, exports.getSignatures)(signatureLevel);
    const jwtid = (0, uuid_1.v4)();
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signatures.access_signature,
        options: {
            expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
            jwtid,
        },
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._id },
        secretKey: signatures.refresh_signature,
        options: {
            expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
            jwtid,
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodeToken = async ({ authorization, tokenType = TokenEnum.access, }) => {
    const userModel = new user_repository_js_1.UserRepository(User_model_js_1.UserModel);
    const tokenModel = new token_repository_js_1.TokenRepository(Token_model_js_1.TokenModel);
    const [bearerKey, token] = authorization.split(" ");
    if (!bearerKey || !token)
        throw new error_response_js_1.UnauthorizedException("Missing Token Parts");
    const signatures = await (0, exports.getSignatures)(bearerKey);
    const decoded = await (0, exports.verifyToken)({
        token,
        secretKey: tokenType === TokenEnum.refresh
            ? signatures.refresh_signature
            : signatures.access_signature,
    });
    if (!decoded?._id || !decoded?.iat)
        throw new error_response_js_1.BadRequestException("Invalid Token Payload");
    if (await tokenModel.findOne({
        filter: {
            jti: decoded.jti,
        },
    })) {
        throw new error_response_js_1.UnauthorizedException("Invalid or old Login Credentials");
    }
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new error_response_js_1.NotFoundException("User Not Found or Registered");
    if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new error_response_js_1.UnauthorizedException("Invalid or old Login Credentials");
    }
    return { user, decoded };
};
exports.decodeToken = decodeToken;
const createRevokedToken = async (decoded) => {
    const tokenModel = new token_repository_js_1.TokenRepository(Token_model_js_1.TokenModel);
    const [result] = (await tokenModel.create({
        data: [
            {
                jti: decoded?.jti,
                expiresIn: decoded?.iat +
                    Number(process.env.JWT_REFRESH_EXPIRES_IN),
                userId: decoded?._id,
            },
        ],
    })) || [];
    if (!result)
        throw new error_response_js_1.BadRequestException("fail to revoke this token");
    return result;
};
exports.createRevokedToken = createRevokedToken;
