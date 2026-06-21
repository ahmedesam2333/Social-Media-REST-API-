import { generateHash } from "./security/hash.security.js";

export const generateOtp = async (): Promise<{
  otp: number;
  hashedOtp: string;
}> => {
  const otp = Math.floor(Math.random() * (999_999 - 100_000 + 1) + 100_000);
  const hashedOtp = await generateHash(String(otp));
  return { otp, hashedOtp };
};

export default generateOtp;
