import { v4 as uuid } from "uuid";
import type { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { sign, verify } from "jsonwebtoken";
import {
  HUserDocument,
  RoleEnum,
  UserModel,
} from "../../DB/models/User.model.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../response/error.response.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { TokenRepository } from "../../DB/repository/token.repository.js";
import { HTokenDocument, TokenModel } from "../../DB/models/Token.model.js";

export enum SignatureLevelEnum {
  Bearer = "Bearer",
  System = "System",
}

export enum TokenEnum {
  access = "access",
  refresh = "refresh",
}

export enum LogoutEnum {
  only = "only",
  all = "all",
}

export const verifyToken = async ({
  token,
  secretKey = process.env.JWT_ACCESS_USER_KEY as string,
}: {
  token: string;
  secretKey?: Secret;
}): Promise<JwtPayload> => {
  return verify(token, secretKey) as JwtPayload;
};

export const generateToken = async ({
  payload,
  secretKey = process.env.JWT_ACCESS_USER_KEY as string,
  options = { expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN) },
}: {
  payload: object;
  secretKey?: Secret;
  options?: SignOptions;
}): Promise<string> => {
  return sign(payload, secretKey, options);
};

export const detectSignatureLevel = async (
  role: RoleEnum = RoleEnum.user,
): Promise<SignatureLevelEnum> => {
  let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;

  switch (role) {
    case RoleEnum.admin:
      signatureLevel;
      SignatureLevelEnum.System;
      break;
    default:
      signatureLevel = SignatureLevelEnum.Bearer;
  }
  return signatureLevel;
};

export const getSignatures = async (
  signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer,
): Promise<{ access_signature: string; refresh_signature: string }> => {
  let signatures: { access_signature: string; refresh_signature: string } = {
    access_signature: "",
    refresh_signature: "",
  };

  switch (signatureLevel) {
    case SignatureLevelEnum.System:
      signatures.access_signature = process.env.JWT_ACCESS_ADMIN_KEY as string;
      signatures.refresh_signature = process.env
        .JWT_REFRESH_ADMIN_KEY as string;
      break;
    default:
      signatures.access_signature = process.env.JWT_ACCESS_USER_KEY as string;
      signatures.refresh_signature = process.env.JWT_REFRESH_USER_KEY as string;
  }
  return signatures;
};

export const createLoginCredentials = async (user: HUserDocument) => {
  const signatureLevel: SignatureLevelEnum = await detectSignatureLevel(
    user.role,
  );

  const signatures = await getSignatures(signatureLevel);

  const jwtid = uuid();

  const access_token = await generateToken({
    payload: { _id: user._id },
    secretKey: signatures.access_signature,
    options: {
      expiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
      jwtid,
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    secretKey: signatures.refresh_signature,
    options: {
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
      jwtid,
    },
  });

  return { access_token, refresh_token };
};

export const decodeToken = async ({
  authorization,
  tokenType = TokenEnum.access,
}: {
  authorization: string;
  tokenType?: TokenEnum;
}) => {
  const userModel = new UserRepository(UserModel);
  const tokenModel = new TokenRepository(TokenModel);

  const [bearerKey, token] = authorization.split(" ");
  if (!bearerKey || !token)
    throw new UnauthorizedException("Missing Token Parts");

  const signatures = await getSignatures(bearerKey as SignatureLevelEnum);

  const decoded = await verifyToken({
    token,
    secretKey:
      tokenType === TokenEnum.refresh
        ? signatures.refresh_signature
        : signatures.access_signature,
  });
  if (!decoded?._id || !decoded?.iat)
    throw new BadRequestException("Invalid Token Payload");

  if (
    await tokenModel.findOne({
      filter: {
        jti: decoded.jti,
      },
    })
  ) {
    throw new UnauthorizedException("Invalid or old Login Credentials");
  }

  const user = await userModel.findOne({ filter: { _id: decoded._id } });

  if (!user) throw new NotFoundException("User Not Found or Registered");

  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw new UnauthorizedException("Invalid or old Login Credentials");
  }

  return { user, decoded };
};

export const createRevokedToken = async (
  decoded: JwtPayload,
): Promise<HTokenDocument> => {
  const tokenModel = new TokenRepository(TokenModel);

  const [result] =
    (await tokenModel.create({
      data: [
        {
          jti: decoded?.jti as string,
          expiresIn:
            (decoded?.iat as number) +
            Number(process.env.JWT_REFRESH_EXPIRES_IN),
          userId: decoded?._id,
        },
      ],
    })) || [];
  if (!result) throw new BadRequestException("fail to revoke this token");

  return result;
};
