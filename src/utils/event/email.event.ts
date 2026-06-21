import { EventEmitter } from "node:events";
import Mail from "nodemailer/lib/mailer/index.js";
import { sendEmail } from "../email/send.email.js";
import { emailTemplate } from "../email/verify.template.email.js";

export const emailEvent = new EventEmitter();

interface IEMail extends Mail.Options {
  otp: number;
}

emailEvent.on("confirmEmail", async (data: IEMail) => {
  try {
    data.subject = "Verify Your Account";
    data.html = emailTemplate({ otp: data.otp, title: "Email Confirmation" });
    data.text = `Your verification code is ${88787}. This code expires in 2 minutes.`;
    await sendEmail(data);
  } catch (error) {
    console.log("Fail to Send Email", error);
  }
});
