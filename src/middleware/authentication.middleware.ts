import type { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/security/token.security.js";
import { BadRequestException } from "../utils/response/error.response.js";
import { HUserDocument } from "../DB/models/User.model.js";
import { JwtPayload } from "jsonwebtoken";

interface IAuthReq extends Request {
  user: HUserDocument;
  decoded: JwtPayload;
}
export const authentication = () => {
  return async (req: IAuthReq, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      throw new BadRequestException("Validation Error", {
        key: "headers",
        issues: [
          { path: "authorization" },
          { message: "missing authorization" },
        ],
      });
    }
    const { user, decoded } = await decodeToken({
      authorization: req.headers.authorization,
    });

    req.user = user;
    req.decoded = decoded;
    next();
  };
};
