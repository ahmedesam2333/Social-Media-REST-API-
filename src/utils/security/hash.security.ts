import bcrypt from "bcrypt";

export const generateHash = async (
  plainText = "",
  salt = Number(process.env.SALT_ROUND),
): Promise<string> => {
  return await bcrypt.hash(plainText, salt);
};

export const compareHash = async (
  plainText = "",
  hashedText = "",
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashedText);
};
