import { z } from "zod";
import * as validators from "./auth.validation.js";

export type ISignupBodyInputsDto = z.infer<typeof validators.signup.body>;
