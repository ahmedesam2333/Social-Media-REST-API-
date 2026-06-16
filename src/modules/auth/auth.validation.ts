import { z } from "zod";
import { generalFields } from "../../middleware/validation.middleware.js";

export const login = {
  body: z.strictObject({
    email: generalFields.email,
    password: generalFields.password,
  }),
};

export const signup = {
  body: login.body
    .extend({
      username: generalFields.username,
      phone: generalFields.phone,
    })
    .superRefine((data, ctx) => {
      if (data.username.split(" ").length !== 2) {
        ctx.addIssue({
          code: "custom",
          path: ["username"],
          message:
            "User Name must contain 2 parts first name and last name like example: John Doe",
        });
      }
    }),
};
