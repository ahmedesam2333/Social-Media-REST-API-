"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const User_model_js_1 = require("./models/User.model.js");
const connectDB = async () => {
    try {
        const result = await (0, mongoose_1.connect)(process.env.MONGO_URI);
        await User_model_js_1.UserModel.syncIndexes();
        console.log(result.models);
        console.log("MongoDB connected successfully 🚀");
    }
    catch (err) {
        console.error("Error connecting to MongoDB ❌", err);
    }
};
exports.default = connectDB;
