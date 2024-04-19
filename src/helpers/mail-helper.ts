import config from "../config/index";
import transporter from "../config/transporter";
import CustomError from "../utils/customError";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const sendMail = async (mailOptions: MailOptions) => {
  try {
    const message = {
      from: config.AWS_SES_SENDER_EMAIL,
      to: mailOptions.to,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    };

    await transporter.sendMail(message);
  } catch (error) {
    console.error("error in sending email", error);
    throw new CustomError("Failed to send email.", 500);
  }
};

export default sendMail;
