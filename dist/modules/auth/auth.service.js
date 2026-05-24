"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signup = (req, res) => {
        return res.status(201).json({ message: "Signup route", data: req.body });
    };
    login = (req, res) => {
        return res.json({ message: "Login route", data: req.body });
    };
}
exports.default = new AuthenticationService();
