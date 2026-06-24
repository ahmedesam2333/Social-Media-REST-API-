"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endpoint = void 0;
const User_model_js_1 = require("../../DB/models/User.model.js");
exports.endpoint = {
    profile: [User_model_js_1.RoleEnum.user],
};
