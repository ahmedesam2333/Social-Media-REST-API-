import { z } from "zod";
import { logout } from "./user.validation.js";

export type ILogoutDto = z.infer<typeof logout.body>;
