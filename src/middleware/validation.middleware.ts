import { z } from "zod";
import type { Request, Response, NextFunction } from "express";
import type { ZodType, ZodError } from "zod";
import { BadRequestException } from "../utils/response/error.response.js";

type KeyReqType = keyof Request;

type SchemaType = Partial<Record<KeyReqType, ZodType>>;

type ValidationErrorsType = Array<{
  key: KeyReqType;
  issues: Array<{
    message: string;
    path: string | number | symbol | undefined;
  }>;
}>;

export const validation = (schema: SchemaType) => {
  return (req: Request, res: Response, next: NextFunction): NextFunction => {
    const validationErrors: ValidationErrorsType = [];

    for (let key of Object.keys(schema) as KeyReqType[]) {
      if (!schema[key]) continue;

      const validationResult = schema[key].safeParse(req[key]);

      if (!validationResult.success) {
        const errors = validationResult.error as ZodError;

        validationErrors.push({
          key,
          issues: errors.issues.map((issue) => {
            return { message: issue.message, path: issue.path[0] };
          }),
        });
      }
    }

    if (validationErrors.length) {
      throw new BadRequestException("Validation Error", { validationErrors });
    }
    return next() as unknown as NextFunction;
  };
};

export const generalFields = {
  email: z.email(),
  password: z
    .string()
    .regex(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
      ),
    ),
  username: z
    .string({ error: "User Name is required" })
    .min(3, { error: "User Name must be at least 3 characters" })
    .max(20, { error: "User Name must be at most 20 characters" }),
  phone: z.string().regex(new RegExp("^01[0125][0-9]{8}$")),
  otp: z.string().regex(/^\d{6}$/),
};
