import { Request } from "express";
import multer, { FileFilterCallback, Multer } from "multer";
import os from "node:os";
import { v4 as uuid } from "uuid";
import { BadRequestException } from "../response/error.response.js";

export enum StorageEnum {
  memory = "memory",
  disk = "disk",
}
export const fileValidation = {
  image: ["image/jpeg", "image/png"],
};

export const cloudFileUpload = ({
  validation = [],
  storageApproach = StorageEnum.memory,
  maxSizeMB = 2,
}: {
  validation?: string[];
  storageApproach?: StorageEnum;
  maxSizeMB?: number;
}): Multer => {
  const storage =
    storageApproach === StorageEnum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: function (
            req: Request,
            file: Express.Multer.File,
            callback,
          ) {
            callback(null, `${uuid()}_${file.originalname}`);
          },
        });
  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) {
    if (!validation.includes(file.mimetype)) {
      return callback(
        new BadRequestException("Validation Error", {
          validationErrors: [
            {
              key: "file",
              issues: [{ path: "file", message: "Invalid file format" }],
            },
          ],
        }),
      );
    }
    return callback(null, true);
  }

  return multer({
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    storage,
  });
};
