import { Response, Request } from "express";
import { ILogoutDto } from "./user.dto.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { HUserDocument, IUser, UserModel } from "../../DB/models/User.model.js";
import { Types, UpdateQuery } from "mongoose";
import {
  createLoginCredentials,
  createRevokedToken,
  LogoutEnum,
} from "../../utils/security/token.security.js";
import { JwtPayload } from "jsonwebtoken";
import {
  createUploadPreSignedLink,
  uploadFile,
} from "../../utils/multer/s3.config.js";
import { BadRequestException } from "../../utils/response/error.response.js";
import { s3Event } from "../../utils/multer/s3.events.js";

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
    // const key = await uploadFile({
    //   file: req.file as Express.Multer.File,
    //   path: `users/${req.decoded?._id}`,
    // });

    const {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;

    const { url, key } = await createUploadPreSignedLink({
      ContentType,
      originalname,
      path: `users/${req.decoded?._id}`,
    });

    const user = await this.userModel.findByIdAndUpdate({
      id: req.user?._id as Types.ObjectId,
      update: {
        profileImage: key,
        tempProfileImage: req.user?.profileImage,
      },
    });

    if (!user)
      throw new BadRequestException("Fail to update user profile image");

    s3Event.emit("trackProfileImageUpload", {
      userId: req.user?._id,
      oldKey: req.user?.profileImage,
      key,
      expiresIn: 30000,
    });

    return res.json({ message: "Done", data: { url, key } });
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
