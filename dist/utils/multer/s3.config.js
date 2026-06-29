"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFolderByPrefix = exports.listDirectoryFiles = exports.deleteFiles = exports.deleteFile = exports.createGetPreSignedLink = exports.getFile = exports.createUploadPreSignedLink = exports.uploadFiles = exports.uploadLargeFile = exports.uploadFile = exports.s3Config = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const cloud_multer_js_1 = require("./cloud.multer.js");
const node_fs_1 = require("node:fs");
const error_response_js_1 = require("../response/error.response.js");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3Config = () => {
    return new client_s3_1.S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        },
    });
};
exports.s3Config = s3Config;
const uploadFile = async ({ storageApproach = cloud_multer_js_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        ACL,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
        Body: storageApproach === cloud_multer_js_1.StorageEnum.memory
            ? file.buffer
            : (0, node_fs_1.createReadStream)(file.path),
        ContentType: file.mimetype,
    });
    await (0, exports.s3Config)().send(command);
    if (!command?.input?.Key) {
        throw new error_response_js_1.BadRequestException("fail to generate upload key");
    }
    return command.input.Key;
};
exports.uploadFile = uploadFile;
const uploadLargeFile = async ({ storageApproach = cloud_multer_js_1.StorageEnum.disk, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", file, }) => {
    const upload = new lib_storage_1.Upload({
        client: (0, exports.s3Config)(),
        params: {
            Bucket,
            ACL,
            Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${file.originalname}`,
            Body: storageApproach === cloud_multer_js_1.StorageEnum.memory
                ? file.buffer
                : (0, node_fs_1.createReadStream)(file.path),
            ContentType: file.mimetype,
        },
    });
    upload.on("httpUploadProgress", (progress) => {
        console.log(`Upload Progress is ${progress}`);
    });
    const { Key } = await upload.done();
    if (!Key) {
        throw new error_response_js_1.BadRequestException("fail to generate upload key");
    }
    return Key;
};
exports.uploadLargeFile = uploadLargeFile;
const uploadFiles = async ({ storageApproach = cloud_multer_js_1.StorageEnum.memory, Bucket = process.env.AWS_BUCKET_NAME, ACL = "private", path = "general", isLarge = false, files, }) => {
    let urls = [];
    if (isLarge) {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadLargeFile)({
                file,
                ACL,
                path,
                Bucket,
                storageApproach,
            });
        }));
    }
    else {
        urls = await Promise.all(files.map((file) => {
            return (0, exports.uploadFile)({
                file,
                ACL,
                path,
                Bucket,
                storageApproach,
            });
        }));
    }
    return urls;
};
exports.uploadFiles = uploadFiles;
const createUploadPreSignedLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, path = "general", ContentType, originalname, expiresIn = 120, }) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket,
        Key: `${process.env.APPLICATION_NAME}/${path}/${(0, uuid_1.v4)()}_${originalname}`,
        ContentType,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url || !command?.input?.Key) {
        throw new error_response_js_1.BadRequestException("FAil to create pre signed url");
    }
    return { url, key: command.input.Key };
};
exports.createUploadPreSignedLink = createUploadPreSignedLink;
const getFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({ Bucket, Key });
    return await (0, exports.s3Config)().send(command);
};
exports.getFile = getFile;
const createGetPreSignedLink = async ({ Bucket = process.env.AWS_BUCKET_NAME, expiresIn = 120, download = false, Key, }) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download
            ? `attachment; filename="${Key.split("/").pop()}"`
            : undefined,
    });
    const url = await (0, s3_request_presigner_1.getSignedUrl)((0, exports.s3Config)(), command, { expiresIn });
    if (!url) {
        throw new error_response_js_1.BadRequestException("FAil to create pre signed url");
    }
    return url;
};
exports.createGetPreSignedLink = createGetPreSignedLink;
const deleteFile = async ({ Bucket = process.env.AWS_BUCKET_NAME, Key, }) => {
    const command = new client_s3_1.DeleteObjectCommand({ Bucket, Key });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFile = deleteFile;
const deleteFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, Quiet = false, urls, }) => {
    const Objects = urls.map((url) => {
        Key: url;
    });
    const command = new client_s3_1.DeleteObjectsCommand({
        Bucket,
        Delete: {
            Objects,
            Quiet,
        },
    });
    return await (0, exports.s3Config)().send(command);
};
exports.deleteFiles = deleteFiles;
const listDirectoryFiles = async ({ Bucket = process.env.AWS_BUCKET_NAME, path, }) => {
    const command = new client_s3_1.ListObjectsV2Command({
        Bucket,
        Prefix: `${process.env.APPLICATION_NAME}/${path}`,
    });
    return (0, exports.s3Config)().send(command);
};
exports.listDirectoryFiles = listDirectoryFiles;
const deleteFolderByPrefix = async ({ Bucket = process.env.AWS_BUCKET_NAME, Quiet = false, path, }) => {
    const fileList = await (0, exports.listDirectoryFiles)({ path });
    if (!fileList?.Contents?.length) {
        throw new error_response_js_1.BadRequestException("Empty Directory");
    }
    const urls = fileList.Contents.map((file) => file.Key);
    return await (0, exports.deleteFiles)({ urls, Quiet });
};
exports.deleteFolderByPrefix = deleteFolderByPrefix;
