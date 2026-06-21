import { createTransport, type Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { BadRequestException } from "../response/error.response.js";
import Mail from "nodemailer/lib/mailer";

export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.html && !data.attachments?.length && !data.text)
    throw new BadRequestException("Missing Email Content");

  const transporter: Transporter<
    SMTPTransport.SentMessageInfo,
    SMTPTransport.Options
  > = createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL as string,
      pass: process.env.APP_PASSWORD as string,
    },
  });

  const info = await transporter.sendMail({
    ...data,
    from: `"Social App Team" <${process.env.APP_EMAIL as string}>`,
    replyTo: process.env.APP_EMAIL,
  });
};
