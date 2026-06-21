"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.createLoginCredentials = exports.getSignatures = exports.detectSignatureLevel = exports.generateToken = exports.verifyToken = exports.TokenEnum = exports.SignatureLevelEnum = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const User_model_js_1 = require("../../DB/models/User.model.js");
const error_response_js_1 = require("../response/error.response.js");
const user_repository_js_1 = require("../../DB/repository/user.repository.js");
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
    const access_token = await (0, exports.generateToken)({
        payload: { _id: user._d },
        secretKey: signatures.access_signature,
    });
    const refresh_token = await (0, exports.generateToken)({
        payload: { _id: user._d },
        secretKey: signatures.refresh_signature,
        options: {
            expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
        },
    });
    return { access_token, refresh_token };
};
exports.createLoginCredentials = createLoginCredentials;
const decodeToken = async ({ authorization, tokenType = TokenEnum.access, }) => {
    const userModel = new user_repository_js_1.UserRepository(User_model_js_1.UserModel);
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
    const user = await userModel.findOne({ filter: { _id: decoded._id } });
    if (!user)
        throw new error_response_js_1.NotFoundException("User Not Found or Registered");
    return { user, decoded };
};
exports.decodeToken = decodeToken;
