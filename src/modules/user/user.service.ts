import { Response, Request } from "express";
import { ILogoutDto } from "./user.dto.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { HUserDocument, IUser, UserModel } from "../../DB/models/User.model.js";
import { UpdateQuery } from "mongoose";
import {
  createLoginCredentials,
  createRevokedToken,
  LogoutEnum,
} from "../../utils/security/token.security.js";
import { JwtPayload } from "jsonwebtoken";
import { uploadFile } from "../../utils/multer/s3.config.js";

class UserService {
  private userModel = new UserRepository(UserModel);

  constructor() {}

  profile = async (req: Request, res: Response): Promise<Response> => {
    return res.json({
      message: "Done",
      data: {
        user: req.user,
        decoded: req.decoded,
      },
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    const key = await uploadFile({
      file: req.file as Express.Multer.File,
      path: `users/${req.decoded?._id}`,
    });

    return res.json({ message: "Done", data: { key } });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: ILogoutDto = req.body;
    let statusCode = 200;

    const update: UpdateQuery<IUser> = {};
    switch (flag) {
      case LogoutEnum.all:
        update.changeCredentialsTime = new Date();
        break;
      default:
        await createRevokedToken(req.decoded as JwtPayload);
        statusCode = 201;
    }

    await this.userModel.updateOne({
      filter: {
        _id: req.decoded?._id,
      },
      update,
    });

    return res.status(statusCode).json({
      message: "Done",
    });
  };

  refreshToken = async (req: Request, res: Response): Promise<Response> => {
    const credentials = await createLoginCredentials(req.user as HUserDocument);
    await createRevokedToken(req.decoded as JwtPayload);

    return res.status(201).json({
      message: "Done",
      data: {
        credentials,
      },
    });
  };
}

export default new UserService();
