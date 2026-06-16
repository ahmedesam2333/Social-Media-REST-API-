import type { Request, Response } from "express";
import { ISignupBodyInputsDto } from "./auth.dto";

class AuthenticationService {
  constructor() {}

  signup = (req: Request, res: Response): Response => {
    const { username, email, password, phone }: ISignupBodyInputsDto = req.body;
    console.log({ username, email, password, phone });
    return res.status(201).json({ message: "Signup route", data: req.body });
  };

  login = (req: Request, res: Response): Response => {
    return res.json({ message: "Login route", data: req.body });
  };
}

export default new AuthenticationService();
