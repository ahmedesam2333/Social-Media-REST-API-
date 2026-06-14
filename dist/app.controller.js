"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const auth_controller_1 = __importDefault(require("./modules/auth/auth.controller"));
const error_response_1 = require("./utils/response/error.response");
const bootstrap = () => {
    const app = (0, express_1.default)();
    const port = Number(process.env.PORT) || 5000;
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 60 * 60 * 1000,
        limit: 200,
        message: {
            error: "Too many requests from this IP, please try again after an hour",
        },
    });
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)(), limiter);
    app.get("/", (req, res) => {
        return res.json({
            message: `Welcome to ${process.env.APPLICATION_NAME} ❤️`,
        });
    });
    app.use("/auth", auth_controller_1.default);
    app.all("{/*dummy}", (req, res) => {
        return res.status(404).json({
            message: "Invalid App Routing please check the method and url ❌",
        });
    });
    app.use(error_response_1.globalErrorHandling);
    app.listen(port, () => {
        console.log(`Server is running on port ${port} 🚀`);
    });
};
exports.default = bootstrap;
