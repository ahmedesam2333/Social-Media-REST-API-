"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.GenderEnum = exports.RoleEnum = void 0;
const mongoose_1 = require("mongoose");
var RoleEnum;
(function (RoleEnum) {
    RoleEnum["user"] = "user";
    RoleEnum["admin"] = "admin";
})(RoleEnum || (exports.RoleEnum = RoleEnum = {}));
var GenderEnum;
(function (GenderEnum) {
    GenderEnum["male"] = "male";
    GenderEnum["female"] = "female";
})(GenderEnum || (exports.GenderEnum = GenderEnum = {}));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
    email: { type: String, required: true, unique: true },
    confirmedAt: { type: Date },
    confirmEmailOtp: { type: String },
    password: { type: String, required: true },
    resetPasswordOtp: { type: String },
    phone: { type: String },
    address: { type: String },
    changeCredentialsTime: { type: Date },
    gender: { type: String, enum: GenderEnum, default: GenderEnum.male },
    role: { type: String, enum: RoleEnum, default: RoleEnum.user },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName });
})
    .get(function () {
    return `${this.firstName} ${this.lastName}`;
});
exports.UserModel = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
