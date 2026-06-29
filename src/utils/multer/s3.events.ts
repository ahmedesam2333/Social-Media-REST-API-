import { EventEmitter } from "node:events";
import { deleteFile, getFile } from "./s3.config.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { UserModel } from "../../DB/models/User.model.js";

export const s3Event = new EventEmitter();

s3Event.on("trackProfileImageUpload", (data) => {
  console.log(data);
  setTimeout(
    async () => {
      const userModel = new UserRepository(UserModel);
      try {
        await getFile({ Key: data.key });

        await userModel.updateOne({
          filter: { _id: data.userId },
          update: {
            $unset: {
              tempProfileImage: 1,
            },
          },
        });

        await deleteFile({ Key: data.oldKey });

        console.log(`Done Uploading`);
      } catch (error: any) {
        console.log(error);

        if (error.Code === "NoSuchKey") {
          await userModel.updateOne({
            filter: { _id: data.userId },
            update: {
              profileImage: data.oldKey,
              $unset: {
                tempProfileImage: 1,
              },
            },
          });
        }
      }
    },
    data.expiresIn ||
      Number(process.env.AWS_URL_PRE_SIGNED_URL_EXPIRES_IN_SECONDS) * 1000,
  );
});
