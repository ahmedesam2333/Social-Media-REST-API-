import { Router } from "express";
import userService from "./user.service.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { validation } from "../../middleware/validation.middleware";
import * as validators from "./user.validation.js";
import { TokenEnum } from "../../utils/security/token.security.js";
import {
  cloudFileUpload,
  fileValidation,
  StorageEnum,
} from "../../utils/multer/cloud.multer.js";

const router = Router();

router.get("/", authentication(), userService.profile);

router.post(
  "/refresh-token",
  authentication(TokenEnum.refresh),
  userService.refreshToken,
);
router.post(
  "/logout",
  authentication(),
  validation(validators.logout),
  userService.logout,
);

router.patch(
  "/profile-image",
  authentication(),
  // cloudFileUpload({
  //   validation: fileValidation.image,
  //   storageApproach: StorageEnum.memory,
  // }).single("image"),
  userService.profileImage,
);

export default router;
