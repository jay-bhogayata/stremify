import config from "../config/index";
import transporter from "../config/transporter";

interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const sendMail = async (mailOptions: MailOptions) => {
  const message = {
    from: config.AWS_SES_SENDER_EMAIL,
    to: mailOptions.to,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html,
  };

  await transporter.sendMail(message);
};

export default sendMail;
