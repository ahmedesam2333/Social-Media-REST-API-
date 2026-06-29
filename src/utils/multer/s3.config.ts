import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { StorageEnum } from "./cloud.multer.js";
import { createReadStream } from "node:fs";
import { BadRequestException } from "../response/error.response.js";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  Bucket = process.env.AWS_BUCKET_NAME as string,
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

export const uploadLargeFile = async ({
  storageApproach = StorageEnum.disk,
  Bucket = process.env.AWS_BUCKET_NAME as string,
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
  const upload = new Upload({
    client: s3Config(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}_${file.originalname}`,
      Body:
        storageApproach === StorageEnum.memory
          ? file.buffer
          : createReadStream(file.path),
      ContentType: file.mimetype,
    },
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`Upload Progress is ${progress}`);
  });

  const { Key } = await upload.done();

  if (!Key) {
    throw new BadRequestException("fail to generate upload key");
  }

  return Key;
};

export const uploadFiles = async ({
  storageApproach = StorageEnum.memory,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  isLarge = false,
  files,
}: {
  storageApproach?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  isLarge?: boolean;
  files: Express.Multer.File[];
}): Promise<string[]> => {
  let urls: string[] = [];

  if (isLarge) {
    urls = await Promise.all(
      files.map((file) => {
        return uploadLargeFile({
          file,
          ACL,
          path,
          Bucket,
          storageApproach,
        });
      }),
    );
  } else {
    urls = await Promise.all(
      files.map((file) => {
        return uploadFile({
          file,
          ACL,
          path,
          Bucket,
          storageApproach,
        });
      }),
    );
  }

  return urls;
};

export const createUploadPreSignedLink = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ContentType,
  originalname,
  expiresIn = Number(process.env.AWS_URL_PRE_SIGNED_URL_EXPIRES_IN_SECONDS),
}: {
  Bucket?: string;
  path?: string;
  expiresIn?: number;
  ContentType: string;
  originalname: string;
}): Promise<{ url: string; key: string }> => {
  const command = new PutObjectCommand({
    Bucket,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}_${originalname}`,
    ContentType,
  });

  const url = await getSignedUrl(s3Config(), command, { expiresIn });
  if (!url || !command?.input?.Key) {
    throw new BadRequestException("FAil to create pre signed url");
  }
  return { url, key: command.input.Key };
};

export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({ Bucket, Key });

  return await s3Config().send(command);
};

export const createGetPreSignedLink = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  expiresIn = Number(process.env.AWS_URL_PRE_SIGNED_URL_EXPIRES_IN_SECONDS),
  download = false,
  Key,
}: {
  Bucket?: string;
  expiresIn?: number;
  download?: boolean;
  Key: string;
}): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
    ResponseContentDisposition: download
      ? `attachment; filename="${Key.split("/").pop()}"`
      : undefined,
  });

  const url = await getSignedUrl(s3Config(), command, { expiresIn });
  if (!url) {
    throw new BadRequestException("FAil to create pre signed url");
  }
  return url;
};

export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}): Promise<DeleteObjectCommandOutput> => {
  const command = new DeleteObjectCommand({ Bucket, Key });

  return await s3Config().send(command);
};

export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Quiet = false,
  urls,
}: {
  Bucket?: string;
  Quiet?: boolean;
  urls: string[];
}): Promise<DeleteObjectsCommandOutput> => {
  const Objects = urls.map((url) => {
    Key: url;
  });

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });

  return await s3Config().send(command);
};

export const listDirectoryFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path,
}: {
  Bucket?: string;
  path: string;
}) => {
  const command = new ListObjectsV2Command({
    Bucket,
    Prefix: `${process.env.APPLICATION_NAME}/${path}`,
  });
  return s3Config().send(command);
};

export const deleteFolderByPrefix = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Quiet = false,
  path,
}: {
  Bucket?: string;
  Quiet?: boolean;
  path: string;
}): Promise<DeleteObjectsCommandOutput> => {
  const fileList = await listDirectoryFiles({ path });

  if (!fileList?.Contents?.length) {
    throw new BadRequestException("Empty Directory");
  }

  const urls: string[] = fileList.Contents.map((file) => file.Key as string);

  return await deleteFiles({ urls, Quiet });
};
