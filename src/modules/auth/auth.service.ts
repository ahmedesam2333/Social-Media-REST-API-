import type { Request, Response } from "express";
import {
  IConfirmEmailInputsDto,
  ILoginBodyInputsDto,
  ISignupBodyInputsDto,
} from "./auth.dto";
import { UserModel } from "../../DB/models/User.model.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../utils/response/error.response.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";
import { emailEvent } from "../../utils/email/email.event.js";
import generateOtp from "../../utils/otp.js";
import {
  createLoginCredentials,
  generateToken,
} from "../../utils/security/token.security.js";

class AuthenticationService {
  private userModel = new UserRepository(UserModel);
  constructor() {}

  signup = async (req: Request, res: Response): Promise<Response> => {
    const { username, email, password }: ISignupBodyInputsDto = req.body;

    const UserExist = await this.userModel.findOne({
      filter: { email },
      select: "email",
      options: {
        lean: true,
      },
    });
    if (UserExist) throw new ConflictException("Email Existed");

    const { otp, hashedOtp } = await generateOtp();

    await this.userModel.createUser({
      data: [
        {
          username,
          email,
          password: await generateHash(password),
          confirmEmailOtp: hashedOtp,
        },
      ],
    });

    emailEvent.emit("confirmEmail", { to: email, otp });

    return res
      .status(201)
      .json({ message: "PLease check your Email for Verification" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: ILoginBodyInputsDto = req.body;

    const user = await this.userModel.findOne({
      filter: { email, confirmedAt: { $exists: true } },
    });
    if (!user || !(await compareHash(password, user.password as string)))
      throw new NotFoundException(
        "Invalid Email or Password or the Email not Verified",
      );

    const Credentials = await createLoginCredentials(user);

    return res.json({
      message: "User Logged In Successfully",
      data: { Credentials },
    });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IConfirmEmailInputsDto = req.body;

    const user = await this.userModel.findOne({
      filter: {
        email,
        confirmedAt: { $exists: false },
        confirmEmailOtp: { $exists: true },
      },
    });
    if (!user)
      throw new NotFoundException("Invalid Email or Already Confirmed");

    if (!(await compareHash(otp, user.confirmEmailOtp as string)))
      throw new BadRequestException("Invalid OTP");

    await this.userModel.updateOne({
      filter: { _id: user._id },
      update: {
        $set: {
          confirmedAt: Date.now(),
        },
        $unset: {
          confirmEmailOtp: 1,
        },
      },
    });

    return res.json({
      message: "Email Verified Successfully Now you can login",
    });
  };
}

export default new AuthenticationService();
