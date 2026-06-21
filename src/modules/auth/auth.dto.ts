import { z } from "zod";
import * as validators from "./auth.validation.js";

export type ISignupBodyInputsDto = z.infer<typeof validators.signup.body>;
export type ILoginBodyInputsDto = z.infer<typeof validators.login.body>;
export type IConfirmEmailInputsDto = z.infer<
  typeof validators.confirmEmail.body
>;
