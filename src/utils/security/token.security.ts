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

export enum SignatureLevelEnum {
  Bearer = "Bearer",
  System = "System",
}

export enum TokenEnum {
  access = "access",
  refresh = "refresh",
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

export const createLoginCredentials = async (
  user: HUserDocument,
): Promise<SignatureLevelEnum> => {
  const signatureLevel: SignatureLevelEnum = await detectSignatureLevel(
    user.role,
  );

  const signatures = await getSignatures(signatureLevel);

  const access_token = await generateToken({
    payload: { _id: user._d },
    secretKey: signatures.access_signature,
  });
  const refresh_token = await generateToken({
    payload: { _id: user._d },
    secretKey: signatures.refresh_signature,
    options: {
      expiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
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

  const user = await userModel.findOne({ filter: { _id: decoded._id } });
  if (!user) throw new NotFoundException("User Not Found or Registered");

  return { user, decoded };
};
