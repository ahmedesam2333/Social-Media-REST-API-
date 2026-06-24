import {
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { StorageEnum } from "./cloud.multer.js";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../response/error.response.js";

export const s3Config = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
    },
  });
};

export const uploadFile = async ({
  storageApproach = StorageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
    Body:
      storageApproach === StorageEnum.memory
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });

  await s3Config().send(command);

  if (!command?.input?.Key) {
    throw new BadRequestException("fail to generate upload key");
  }
  return command.input.Key;
};
