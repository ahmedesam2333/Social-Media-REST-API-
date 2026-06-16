"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AuthenticationService {
    constructor() { }
    signup = (req, res) => {
        const { username, email, password, phone } = req.body;
        console.log({ username, email, password, phone });
        return res.status(201).json({ message: "Signup route", data: req.body });
    };
    login = (req, res) => {
        return res.json({ message: "Login route", data: req.body });
    };
}
exports.default = new AuthenticationService();
