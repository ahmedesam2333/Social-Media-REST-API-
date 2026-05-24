import { z } from "zod";

export const signup = {
  body: z.strictObject({
    username: z.string().min(3).max(20),
    email: z.email(),
    password: z
      .string()
      .regex(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
        )
      ),
    phone: z.string().regex(new RegExp("^01[0125][0-9]{8}$")),
  }),
};
